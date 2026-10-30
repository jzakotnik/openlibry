/// <reference types="cypress" />

// The camera itself cannot be driven from Cypress: getUserMedia needs a real
// device and a permission grant that headless Chrome will not fake. What is
// worth covering is everything around it, above all the secure-context guard.
// That is not an edge case here: OpenLibry is typically served over plain HTTP
// on a school LAN, where the browser exposes no camera at all, so this is the
// path most installations will actually take.

// Fakes the camera API so the failure and switching paths can run at all.
function stubCamera(win: Cypress.AUTWindow, getUserMedia: any) {
  Object.defineProperty(win.navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia,
      enumerateDevices: async () => [
        { kind: "videoinput", deviceId: "cam-a", label: "Back" },
        { kind: "videoinput", deviceId: "cam-b", label: "Front" },
      ],
    },
  });
}

// A transformed ancestor would trap the fixed overlay inside the input.
function expectFullScreen() {
  cy.window().then((win) => {
    cy.get("[data-cy=scan_camera_preview]").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.top).to.equal(0);
      expect(rect.left).to.equal(0);
      expect(rect.width).to.equal(win.document.documentElement.clientWidth);
      expect(rect.height).to.equal(win.document.documentElement.clientHeight);
    });
  });
}

describe("Camera barcode scanner", () => {
  before(() => {
    cy.resetAndSeed();
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.session("user-session", () => {
      cy.login();
    });
  });

  it("should offer the camera inside the batch scan ISBN input", () => {
    cy.visit("/book/batchscan");
    cy.get("[data-cy=scan_camera_toggle]").should("be.visible");
  });

  it("should warn instead of clearing the field when the ISBN is empty", () => {
    cy.visit("/book/batchscan");
    cy.get("[data-cy=batch-scan-add-button]").click();
    cy.contains("Bitte eine gültige ISBN eingeben").should("be.visible");
    cy.get("[data-cy=batch-scan-entry]").should("not.exist");
  });

  it("should explain that HTTPS is needed when the page is not a secure context", () => {
    cy.visit("/book/batchscan", {
      onBeforeLoad(win) {
        // Plain HTTP on a LAN: navigator.mediaDevices is undefined and the
        // zxing call throws. Without the guard this surfaced as the generic
        // "Kamerazugriff nicht möglich." with no hint at the real cause.
        Object.defineProperty(win, "isSecureContext", {
          value: false,
          configurable: true,
        });
      },
    });

    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_error]")
      .should("be.visible")
      .and("contain", "HTTPS");
    cy.get("[data-cy=scan_camera_retry]").should("not.exist");
  });

  it("should scan full screen and close again", () => {
    cy.visit("/book/batchscan", {
      onBeforeLoad(win) {
        Object.defineProperty(win, "isSecureContext", {
          value: false,
          configurable: true,
        });
      },
    });

    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_preview]").should("be.visible");
    expectFullScreen();
    cy.get("[data-cy=scan_camera_close]").click();
    cy.get("[data-cy=scan_camera_preview]").should("not.exist");
    cy.get("[data-cy=batch-scan-isbn-input]").should("be.visible");
  });

  it("should show the scan frame and hint while the camera runs", () => {
    cy.visit("/book/batchscan", {
      onBeforeLoad(win) {
        stubCamera(win, () => new Promise(() => {}));
      },
    });

    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_frame]").should("exist");
    cy.contains("Barcode in den Rahmen halten").should("exist");
  });

  it("should name the cause of a failure and retry", () => {
    const failures = ["NotAllowedError", "NotFoundError"];
    cy.visit("/book/batchscan", {
      onBeforeLoad(win) {
        stubCamera(win, () =>
          Promise.reject(new win.DOMException("", failures.shift())),
        );
      },
    });

    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_error]").should("contain", "verweigert");
    cy.get("[data-cy=scan_camera_retry]").click();
    cy.get("[data-cy=scan_camera_error]").should(
      "contain",
      "Keine Kamera gefunden",
    );
  });

  it("should switch between cameras", () => {
    cy.visit("/book/batchscan", {
      onBeforeLoad(win) {
        const canvas = win.document.createElement("canvas");
        win.setInterval(
          () => canvas.getContext("2d")?.fillRect(0, 0, 10, 10),
          50,
        );
        stubCamera(
          win,
          cy
            .stub()
            .as("getUserMedia")
            .callsFake(async () => canvas.captureStream(10)),
        );
      },
    });

    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_switch]").click();
    cy.get("@getUserMedia").should((stub: any) => {
      expect(stub.lastCall.args[0].video.deviceId.exact).to.equal("cam-a");
    });
  });

  it("should scan full screen from the book edit ISBN field", () => {
    cy.visit("/book/new");
    cy.get("[data-cy=book-isbn-field]").should("be.visible");
    cy.get("[data-cy=scan_camera_toggle]").click();
    cy.get("[data-cy=scan_camera_preview]").should("be.visible");
    expectFullScreen();
    cy.get("[data-cy=scan_camera_close]").click();
    cy.get("[data-cy=scan_camera_preview]").should("not.exist");
  });
});

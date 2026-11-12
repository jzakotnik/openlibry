/// <reference types="cypress" />
import {
  BARCODE_PRESETS,
  normalizeScanCode,
  parseBarcodeAdapterConfig,
} from "../../lib/utils/barcodeAdapter";
import { classifyScan } from "../../lib/utils/scanClassifier";

const sbc = BARCODE_PRESETS.sbc;

describe("barcode adapter", () => {
  it("passes input through when no adapter is configured", () => {
    expect(normalizeScanCode("$69JGQNTPLIEM%", [])).to.equal("$69JGQNTPLIEM%");
    expect(normalizeScanCode("12345", [])).to.equal("12345");
  });

  it("decodes an SBC barcode to the 8-digit id", () => {
    expect(normalizeScanCode("$69JGQNTPLIEM%", sbc)).to.equal("99999995");
    expect(normalizeScanCode("$69jgqntpliem%", sbc)).to.equal("99999995");
  });

  it("leaves non-SBC input and bad check digits untouched", () => {
    expect(normalizeScanCode("Harry Potter", sbc)).to.equal("Harry Potter");
    expect(normalizeScanCode("9783161484100", sbc)).to.equal("9783161484100");
    // TPLIEN = ...959, wrong EAN check digit
    expect(normalizeScanCode("$69JGQNTPLIEN%", sbc)).to.equal("$69JGQNTPLIEN%");
  });

  it("supports custom steps and survives bad config", () => {
    const steps = parseBarcodeAdapterConfig(
      '[{"type":"match","pattern":"^LIB-(\\\\d+)$"},{"type":"trimLeadingZeros"}]',
    );
    expect(normalizeScanCode("LIB-000042", steps)).to.equal("42");
    expect(parseBarcodeAdapterConfig("not json")).to.deep.equal([]);
    expect(
      normalizeScanCode("abc", [{ type: "match", pattern: "([" }]),
    ).to.equal("abc");
  });

  it("recognises the preset names", () => {
    expect(parseBarcodeAdapterConfig("SBC")).to.equal(sbc);
  });

  it("classifyScan is unchanged without a configured adapter", () => {
    expect(classifyScan("42")).to.deep.equal({ type: "id", id: 42 });
  });
});

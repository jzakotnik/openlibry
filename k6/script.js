import { sleep } from "k6";
import http from "k6/http";

export default function () {
  http.get("http://192.168.178.20:3000/");
  for (let id = 2000; id <= 2010; id++) {
    http.get(`http://192.168.178.20:3000/book/${id}`);
  }
  sleep(0.1);
}

//run with
// podman run --rm -i grafana/k6 run --vus 1 --duration 10s --http-debug=full - <script.js

import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: "http_request_total",
  help: "Total HTTP Requests",
  labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestsTotal);

export { register };

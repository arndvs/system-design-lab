import { describe, expect, it } from "vitest";
import { components } from "../src/content/components";
import { MULTI_SERVER_RPS } from "../src/content/rules";
import { defaultRequirements, recommend } from "../src/engine/recommend";
import { defaultEstimate, estimateFromHash, estimateToParams, fromHash } from "../src/state";
import { layerDiagram, OFF_PATH, REQUEST_PATH } from "../src/ui/diagram";
import { peakVerdict } from "../src/ui/estimate";

describe("layer diagram", () => {
  const ids = Object.keys(recommend({ ...defaultRequirements, asyncWork: true, mediaUploads: true }).components);

  it("gives every layer a row, so no component can be left out", () => {
    const rows = new Set([...REQUEST_PATH, ...OFF_PATH].map((layer) => layer.id));
    for (const c of Object.values(components)) expect(rows.has(c.layer), `${c.id} is in layer ${c.layer}`).toBe(true);
  });

  it("shows every component in the design", () => {
    const html = layerDiagram(ids);
    for (const id of ids) expect(html).toContain(components[id]!.name.replace("&", "&amp;"));
  });

  it("puts the request path in order, with the off-path layers after it", () => {
    const html = layerDiagram(ids);
    const at = (label: string) => html.indexOf(`>${label}</p>`);
    expect(at("Client")).toBeLessThan(at("Edge"));
    expect(at("Edge")).toBeLessThan(at("Entry"));
    expect(at("Entry")).toBeLessThan(at("Compute"));
    expect(at("Compute")).toBeLessThan(at("Data"));
    expect(at("Data")).toBeLessThan(html.indexOf("Beside the request path"));
    expect(html.indexOf("Beside the request path")).toBeLessThan(at("Async"));
  });

  it("marks only the fresh components as new", () => {
    const html = layerDiagram(ids, { fresh: ["message-queue"] });
    expect(html.match(/\(new\)/g)).toHaveLength(1);
  });

  it("renders boxes as buttons that name their component when interactive", () => {
    const html = layerDiagram(ids, { interactive: true });
    for (const id of ids) expect(html).toContain(`data-goto="${id}"`);
    expect(layerDiagram(ids)).not.toContain("data-goto");
  });
});

describe("estimate link state", () => {
  it("round-trips non-default inputs and leaves defaults out of the link", () => {
    expect(estimateToParams(defaultEstimate)).toEqual([]);
    const changed = { ...defaultEstimate, dailyActiveUsers: 250_000, copies: 2 };
    const hash = new URLSearchParams(estimateToParams(changed)).toString();
    expect(hash).toBe("dau=250000&copies=2");
    expect(estimateFromHash(hash)).toEqual(changed);
  });

  it("falls back to the default for values that are not positive numbers", () => {
    expect(estimateFromHash("dau=0&rpu=abc&peak=-2")).toEqual(defaultEstimate);
  });

  it("does not disturb the requirements in the same link", () => {
    expect(fromHash("dau=5&view=estimate&rps=4000").peakRps).toBe(4000);
  });
});

describe("peak verdict", () => {
  it("quotes the same threshold the rules use", () => {
    expect(peakVerdict(MULTI_SERVER_RPS + 1)).toContain("more than one application server");
    expect(peakVerdict(MULTI_SERVER_RPS)).toContain("will not add servers");
  });
});

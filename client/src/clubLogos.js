export function clubLogo(name) {
  const key = String(name || "").toLowerCase().replace(/[^a-z]/g, "");
  return {
    codeio: "/clubs/codeio.jpg",
    ninaad: "/clubs/ninaad.jpg",
    danzaddix: "/clubs/danzaddix.jpg",
    pentagram: "/clubs/pentagram.jpg",
    falcons: "/clubs/falcons.jpg",
    pravrutthi: "/clubs/pravrutthi.jpg",
    protocol: "/clubs/protocol.jpg",
  }[key] || "";
}

export function prefixSvgIds(svg: string, prefix: string) {
    // 1) id="..."
    let out = svg.replaceAll('id="', `id="${prefix}-`);

    // 2) url(#...)
    out = out.replaceAll("url(#", `url(#${prefix}-`);

    // 3) href="#..." (caso exista)
    out = out.replaceAll('href="#', `href="#${prefix}-`);

    // 4) xlink:href="#..." (legado)
    out = out.replaceAll('xlink:href="#', `xlink:href="#${prefix}-`);

    return out;
}

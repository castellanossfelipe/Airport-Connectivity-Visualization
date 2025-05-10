function createLegend(sizeScale, airportBubbles) {
    const legend = d3.select("body").append("div")
    .attr("class", "legend");

    legend.append("h3")
    .text("Outgoing Flights")
    .style("margin", "0 0 10px 0")
    .style("font-size", "16px");

    legend.append("p")
        .text("Click a bubble group to filter by size.")
        .style("margin", "0 0 12px 0")
        .style("font-size", "12px")
        .style("color", "#ccc")
        .style("line-height", "1.4");

    const legendItems = [
    {text: "1-25", color: "#c6dbef"},
    {text: "26-75", color: "#9ecae1"},
    {text: "76-150", color: "#6baed6"},
    {text: "151-300", color: "#4292c6"},
    {text: "301-500", color: "#2171b5"},
    {text: "501+", color: "#084594"}
    ];

    // Container to align items vertically
    const legendContainer = legend.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("gap", "6px")
    .style("align-items", "flex-start");

    let selectedRange = null; // Track currently selected filter

    legendItems.forEach(item => {
    const [minText, maxText] = item.text.includes('+')
        ? [parseInt(item.text), Infinity]
        : item.text.split('-').map(d => parseInt(d));

    const minCount = minText || 1;
    const maxCount = maxText || Infinity;

    const radius = sizeScale(minCount);
    const diameter = 2 * radius;

    const row = legendContainer.append("div")
        .attr("class", "legend-row")
        .style("display", "flex")
        .style("align-items", "center")
        .style("cursor", "pointer")
        .style("padding", "4px 6px")
        .style("border-radius", "4px")
        .on("click", function () {
        // Toggle selection
        const isSame = selectedRange?.[0] === minCount && selectedRange?.[1] === maxCount;
        selectedRange = isSame ? null : [minCount, maxCount];

        // Style legend rows based on selection
        legendContainer.selectAll(".legend-row")
            .style("background-color", "transparent");

        d3.select(this)
            .style("background-color", isSame ? "transparent" : "rgba(255, 255, 255, 0.15)");

        // Update visible circles
        airportBubbles
            .style("display", d => {
            const count = d["Destination Count"];
            if (!selectedRange) return "block";
            return count >= selectedRange[0] && count <= selectedRange[1] ? "block" : "none";
            });
        });

    row.append("div")
        .style("width", `${diameter}px`)
        .style("height", `${diameter}px`)
        .style("background", item.color)
        .style("border-radius", "50%")
        .style("margin-right", "10px")
        .style("border", "1px solid #444")
        .style("flex-shrink", "0")
        .style("border", item.color === "#c6dbef" ? "1px solid #aaa" : "1px solid #444");

    row.append("span")
        .style("font-size", "13px")
        .text(item.text);
    })
};
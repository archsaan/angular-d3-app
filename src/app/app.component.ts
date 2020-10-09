import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private svg;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);
  invalidation: any;
  link: any;
  node: any;
  title = 'my-app';
  private createSvg(): void {
    this.svg = d3.select("figure#bar")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  ngOnInit(): void {
    this.createSvg();
    d3.json('./assets/miserables.json').then(data => this.drawNodes(data));
  }
  private drawNodes(data) {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
    let isTooltipHidden = true;

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance((150)).strength(1))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    const labels = this.svg.append("g")
      .attr("class", "label")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("dx", 10)
      .attr("dy", ".35em")
      .style("font-size", 10)
      .text(function (d) { return d.name });

    const link = this.svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = this.svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", d => this.getColor(d.group))
      .call(this.drag(simulation))
      .on("click", clickNode);

    function clickNode(event, node) {
      // update visibility
      isTooltipHidden = !isTooltipHidden;
      var visibility = (isTooltipHidden) ? "hidden" : "visible";

      // load tooltip content (if it changes based on node)
      loadTooltipContent(node);

      if (isTooltipHidden) {
        unPinNode(node);
      }

      // place tooltip where cursor was
      return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px").style("visibility", visibility);
    }
    // reset nodes to not be pinned
    const unPinNode = (node) => {
      node.fx = null;
      node.fy = null;
    }
    // add html content to tooltip
    const loadTooltipContent = (node) => {
      let htmlContent = "<span>Total count : " + node.connections + "<\/span>"
      htmlContent += "<br>"
      htmlContent += "<a href=''>View more</a>"
      tooltip.html(htmlContent);
    }
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "10px")
      .style("z-index", "10")
      .style("width", "auto")
      .style("height", "auto")
      .style("background-color", "grey")
      .style("visibility", "hidden")
      .text("");


    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; });
    });

    //this.invalidation.then(() => simulation.stop());

    return this.svg.node();
  }

  getColor = (group) => {
    switch (group) {
      case 'department':
        return "#d89e9e"
      case 'area':
        return "#545A6C"
      case 'zip':
        return "#86be96"
      default:
        return "#86be96"
    }

  }
  drag = simulation => {

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

}

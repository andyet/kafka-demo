import * as d3 from 'd3'

const minMargin = 15
const margin = {
  top: minMargin,
  right: minMargin,
  bottom: minMargin + 8,
  left: minMargin + 17
}

export default class BarChart {
  constructor (options) {
    this.container = document.querySelector(options.selector)

    this.xVariable = options.x
    this.yVariable = options.y
    this.transition = options.transition

    const svg = d3
      .select(this.container)
      .classed('loading', false)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    const chartArea = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.barGroup = chartArea.append('g')
    this.xAxisG = chartArea.append('g')
    this.yAxisG = chartArea.append('g')

    this._lastData = options.data

    this.init()
  }

  getHeight () {
    return this.container.clientHeight
  }

  getWidth () {
    return this.container.clientWidth
  }

  init () {
    this.updateScaleAndAxesData({ first: true })
    this.updateScales({ first: true })
    this.updateAxes({ first: true })
    this.updateBars({ first: true })
    d3.select(window).on('resize', () => this.resize())
  }

  resize () {
    this.updateScaleAndAxesData()
    this.updateScales()
    this.updateAxes()
    this.updateBars()
  }

  update (data) {
    this._lastData = data || this._lastData

    this.updateScaleAndAxesData({ transition: this.transition })
    this.updateScales({ transition: this.transition })
    this.updateAxes({ transition: this.transition })
    this.updateBars({ transition: this.transition })
  }

  updateScaleAndAxesData () {
    // Initialise scales
    this.xScale = d3
      .scaleBand()
      .domain(this._lastData.map(d => d[this.xVariable]))

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this._lastData.map(d => d[this.yVariable]))])

    // Build the x-axis
    this.xAxis = d3
      .axisBottom()
      .scale(this.xScale)

    // Build the y-axis
    this.yAxis = d3
      .axisLeft()
      .tickFormat(d3.format('.0s'))
      .scale(this.yScale)
  }

  updateScales () {
    const newWidth = this.getWidth() - margin.left - margin.right
    const newHeight = this.getHeight() - margin.top - margin.bottom

    this.xScale
      .range([0, newWidth])
      .paddingInner(0.1)
      .bandwidth(10)

    this.yScale.range([newHeight, 0])
  }

  updateAxes (options = {}) {
    const newHeight = this.getHeight()

    // position the xAxisG before the transition the first time
    if (options.first) {
      this.xAxisG.attr('transform', `translate(0, ${newHeight - margin.top - margin.bottom})`)
    }

    this.xAxisG
      .transition()
      .duration(options.transition || 0)
      .attr('transform', `translate(0, ${newHeight - margin.top - margin.bottom})`)
      .call(this.xAxis)

    this.yAxisG
      .transition()
      .duration(options.transition || 0)
      .call(this.yAxis)
  }

  updateBars (options = {}) {
    const updateSelection = this.barGroup
      .selectAll('rect')
      .data(this._lastData)

    const enterSelection = updateSelection
      .enter()
      .append('rect')

    updateSelection
      .exit()
      .remove()

    enterSelection
      .merge(updateSelection)
      .transition()
      .duration(options.transition || 0)
      .attr('x', (d) => this.xScale(d[this.xVariable]))
      .attr('width', this.xScale.bandwidth)
      .attr('y', d => this.yScale(d[this.yVariable]))
      .attr('height', d => this.yScale(0) - this.yScale(d[this.yVariable]))
  }
}
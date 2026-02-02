

import * as p from "core/properties"
import {LayoutDOM, LayoutDOMView} from "models/layouts/layout_dom"
import {div} from "core/dom"
import {getProjection, getProjectionScale, Point2D} from "./projections"
import {getPalette, valueToColor, getValueRange} from "./palettes"

interface ScatterPoint {
  lon: number
  lat: number
  size?: number
  color?: string
  border_color?: string
  border_width?: number
  label?: string
}

interface Line {
  coords: Array<[number, number]>
  color?: string
  width?: number
  label?: string
}

export class GriddedProjectionView extends LayoutDOMView {
  declare model: GriddedProjection

  private container_el?: HTMLDivElement
  private canvas?: HTMLCanvasElement
  private ctx?: CanvasRenderingContext2D
  private colorbar_canvas?: HTMLCanvasElement
  private colorbar_ctx?: CanvasRenderingContext2D
  private tooltip_el?: HTMLDivElement
  private mouse_x: number = 0
  private mouse_y: number = 0
  
  private is_dragging: boolean = false
  private drag_start_x: number = 0
  private drag_start_y: number = 0
  private drag_start_pan_x: number = 0
  private drag_start_pan_y: number = 0
  private pan_offset_x: number = 0
  private pan_offset_y: number = 0

  override get child_models(): LayoutDOM[] {
    return []
  }

  override connect_signals(): void {
    super.connect_signals()
    
    this.connect(this.model.properties.projection.change, () => this.render_map())
    this.connect(this.model.properties.rotation.change, () => this.render_map())
    this.connect(this.model.properties.zoom.change, () => this.render_map())
    this.connect(this.model.properties.palette.change, () => {
      this.render_map()
      this.render_colorbar()
    })
    this.connect(this.model.properties.vmin.change, () => this.render_colorbar())
    this.connect(this.model.properties.vmax.change, () => this.render_colorbar())
    this.connect(this.model.properties.background_color.change, () => {
      if (this.container_el) {
        this.container_el.style.background = this.model.background_color
      }
      this.render_map()
      this.render_colorbar()
    })
    this.connect(this.model.properties.colorbar_text_color.change, () => this.render_colorbar())
    this.connect(this.model.properties.show_colorbar.change, () => {
      if (this.colorbar_canvas) {
        this.colorbar_canvas.style.display = this.model.show_colorbar ? 'block' : 'none'
      }
    })
    this.connect(this.model.properties.scatter_data.change, () => this.render_map())
    this.connect(this.model.properties.line_data.change, () => this.render_map())
    this.connect(this.model.properties.values.change, () => {
      this.render_map()
      this.render_colorbar()
    })
    this.connect(this.model.properties.colorbar_title.change, () => this.render_colorbar())
    this.connect(this.model.properties.show_coastlines.change, () => this.render_map())
    this.connect(this.model.properties.coastline_color.change, () => this.render_map())
    this.connect(this.model.properties.coastline_width.change, () => this.render_map())
    this.connect(this.model.properties.show_countries.change, () => this.render_map())
    this.connect(this.model.properties.country_color.change, () => this.render_map())
    this.connect(this.model.properties.country_width.change, () => this.render_map())
  }

  override render(): void {
    super.render()
    
    const width = this.model.width ?? 1000
    const height = this.model.height ?? 600
    
    this.container_el = div({style: {
      width: `${width + 140}px`,
      height: `${height}px`,
      background: this.model.background_color,
      position: 'relative',
      display: 'flex',
      cursor: 'move'
    }})
    
    // Main canvas
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.container_el.appendChild(this.canvas)
    
    // Colorbar canvas
    if (this.model.show_colorbar) {
      this.colorbar_canvas = document.createElement('canvas')
      this.colorbar_canvas.width = 120
      this.colorbar_canvas.height = height
      this.colorbar_canvas.style.marginLeft = '20px'
      this.container_el.appendChild(this.colorbar_canvas)
      this.colorbar_ctx = this.colorbar_canvas.getContext('2d')!
    }
    
    // Tooltip
    this.tooltip_el = div({style: {
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      display: 'none',
      zIndex: '1000',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      whiteSpace: 'nowrap'
    }})
    this.container_el.appendChild(this.tooltip_el)
    
    this.setup_interactions()
    this.shadow_el.appendChild(this.container_el)
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!
    this.render_map()
    this.render_colorbar()
  }

  private render_colorbar(): void {
    if (!this.colorbar_ctx || !this.colorbar_canvas || !this.model.show_colorbar) return
    
    const ctx = this.colorbar_ctx
    const canvas = this.colorbar_canvas
    const width = canvas.width
    const height = canvas.height
    
    // Clear
    ctx.fillStyle = this.model.background_color
    ctx.fillRect(0, 0, width, height)
    
    const palette = getPalette(this.model.palette)
    const {vmin, vmax} = getValueRange(this.model.values, this.model.vmin, this.model.vmax)
    
    // Colorbar dimensions
    const bar_width = 30
    const bar_height = height * 0.7
    const bar_x = 35
    const bar_y = (height - bar_height) / 2
    
    // Draw color gradient
    const step = bar_height / palette.length
    for (let i = 0; i < palette.length; i++) {
      ctx.fillStyle = palette[palette.length - 1 - i]
      ctx.fillRect(bar_x, bar_y + i * step, bar_width, step + 1)
    }
    
    // Draw border
    ctx.strokeStyle = this.model.colorbar_text_color
    ctx.lineWidth = 1
    ctx.strokeRect(bar_x, bar_y, bar_width, bar_height)
    
    // Draw ticks and labels
    ctx.fillStyle = this.model.colorbar_text_color
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    
    const n_ticks = 5
    for (let i = 0; i < n_ticks; i++) {
      const frac = i / (n_ticks - 1)
      const value = vmin + (vmax - vmin) * (1 - frac)
      const y = bar_y + frac * bar_height
      
      // Tick mark
      ctx.beginPath()
      ctx.moveTo(bar_x + bar_width, y)
      ctx.lineTo(bar_x + bar_width + 5, y)
      ctx.stroke()
      
      // Label
      const label = value.toFixed(1)
      ctx.fillText(label, bar_x + bar_width + 10, y + 4)
    }
    
    // Title
    if (this.model.colorbar_title) {
      ctx.save()
      ctx.translate(12, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.font = 'bold 13px monospace'
      ctx.fillStyle = this.model.colorbar_text_color
      ctx.fillText(this.model.colorbar_title, 0, 0)
      ctx.restore()
    }
  }

  private setup_interactions(): void {
    if (!this.canvas) return
    
    this.canvas.onmousedown = (e) => {
      this.is_dragging = true
      this.drag_start_x = e.clientX
      this.drag_start_y = e.clientY
      this.drag_start_pan_x = this.pan_offset_x
      this.drag_start_pan_y = this.pan_offset_y
      this.container_el!.style.cursor = 'move'
    }
    
    this.canvas.onmousemove = (e) => {
      const rect = this.canvas!.getBoundingClientRect()
      this.mouse_x = e.clientX - rect.left
      this.mouse_y = e.clientY - rect.top
      
      if (this.is_dragging) {
        const dx = e.clientX - this.drag_start_x
        const dy = e.clientY - this.drag_start_y
        this.pan_offset_x = this.drag_start_pan_x + dx
        this.pan_offset_y = this.drag_start_pan_y + dy
        this.render_map()
      } else if (this.model.enable_hover) {
        this.update_tooltip()
      }
    }
    
    this.canvas.onmouseup = () => {
      this.is_dragging = false
      this.container_el!.style.cursor = 'move'
    }
    
    this.canvas.onmouseleave = () => {
      this.is_dragging = false
      this.container_el!.style.cursor = 'move'
      if (this.tooltip_el) {
        this.tooltip_el.style.display = 'none'
      }
    }
    
    this.canvas.onwheel = (e) => {
      e.preventDefault()
      const delta = -Math.sign(e.deltaY) * 0.1
      const new_zoom = this.model.zoom + delta
      this.model.zoom = Math.max(0.5, Math.min(8.0, new_zoom))
    }
  }

  private render_map(): void {
    if (!this.ctx) return
    
    const ctx = this.ctx
    const width = this.model.width ?? 1000
    const height = this.model.height ?? 600
    
    ctx.fillStyle = this.model.background_color
    ctx.fillRect(0, 0, width, height)
    
    const project = getProjection(this.model.projection)
    const scale = getProjectionScale(this.model.projection, width, height) * this.model.zoom
    const cx = width / 2 + this.pan_offset_x
    const cy = height / 2 + this.pan_offset_y
    const rotation = this.model.rotation
    
    // Project all points
    const projected = this.model.lons.map((lon, i) => {
      const rotated_lon = lon - rotation
      const p = project(rotated_lon, this.model.lats[i])
      return {
        x: cx + p.x * scale,
        y: cy - p.y * scale
      }
    })
    
    // Draw quads
    const palette = getPalette(this.model.palette)
    const {vmin, vmax} = getValueRange(this.model.values, this.model.vmin, this.model.vmax)
    
    const n_lat = this.model.n_lat
    const n_lon = this.model.n_lon
    
    for (let i = 0; i < n_lat - 1; i++) {
      for (let j = 0; j < n_lon - 1; j++) {
        const idx0 = i * n_lon + j
        const idx1 = i * n_lon + (j + 1)
        const idx2 = (i + 1) * n_lon + (j + 1)
        const idx3 = (i + 1) * n_lon + j
        
        const avg_value = (this.model.values[idx0] + this.model.values[idx1] + 
                          this.model.values[idx2] + this.model.values[idx3]) / 4
        const color = valueToColor(avg_value, palette, vmin, vmax, this.model.nan_color)
        
        ctx.fillStyle = color
        ctx.strokeStyle = color
        ctx.lineWidth = 1.2
        
        ctx.beginPath()
        ctx.moveTo(projected[idx0].x, projected[idx0].y)
        ctx.lineTo(projected[idx1].x, projected[idx1].y)
        ctx.lineTo(projected[idx2].x, projected[idx2].y)
        ctx.lineTo(projected[idx3].x, projected[idx3].y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    }
    
    if (this.model.show_coastlines) {
      this.draw_coastlines(project, scale, cx, cy, rotation)
    }
    
    if (this.model.show_countries) {
      this.draw_countries(project, scale, cx, cy, rotation)
    }
    
    this.draw_lines(project, scale, cx, cy, rotation)
    this.draw_scatter(project, scale, cx, cy, rotation)
  }

  // ─── polyline drawer with antimeridian wrap guard ────────────────────────
  // Both coastlines and countries store coordinates as flat lon/lat arrays
  // with null as segment separator.  Some segments (e.g. Antarctica) are
  // closed polygons whose data wraps from +180 back to −180 in a single
  // segment.  Without a guard, the canvas lineTo draws a line straight
  // across the entire map at that wrap point.
  //
  // Guard: whenever two consecutive (non-null) longitudes differ by more
  // than 180° we treat it as a break — moveTo instead of lineTo.  This
  // silently splits the segment at the antimeridian with no visible effect
  // on the coastline shape because the two halves are drawn separately.
  // ─────────────────────────────────────────────────────────────────────────
  private draw_polyline(
    lons: any[], lats: any[],
    project: (lon: number, lat: number) => Point2D,
    scale: number, cx: number, cy: number, rotation: number
  ): void {
    if (!this.ctx) return
    const ctx = this.ctx

    ctx.beginPath()
    let drawing = false
    let prev_lon = 0

    for (let i = 0; i < lons.length; i++) {
      if (lons[i] === null) {
        drawing = false
        continue
      }

      // antimeridian wrap: break the sub-path
      if (drawing && Math.abs(lons[i] - prev_lon) > 180) {
        drawing = false
      }
      prev_lon = lons[i]

      const rotated_lon = lons[i] - rotation
      const p = project(rotated_lon, lats[i])
      const px = cx + p.x * scale
      const py = cy - p.y * scale

      if (!drawing) {
        ctx.moveTo(px, py)
        drawing = true
      } else {
        ctx.lineTo(px, py)
      }
    }

    ctx.stroke()
  }

  private draw_coastlines(project: (lon: number, lat: number) => Point2D, 
                         scale: number, cx: number, cy: number, rotation: number): void {
    if (!this.ctx) return
    this.ctx.strokeStyle = this.model.coastline_color
    this.ctx.lineWidth = this.model.coastline_width
    this.draw_polyline(this.model.coast_lons, this.model.coast_lats, project, scale, cx, cy, rotation)
  }

  private draw_countries(project: (lon: number, lat: number) => Point2D, 
                         scale: number, cx: number, cy: number, rotation: number): void {
    if (!this.ctx) return
    this.ctx.strokeStyle = this.model.country_color
    this.ctx.lineWidth = this.model.country_width
    this.draw_polyline(this.model.country_lons, this.model.country_lats, project, scale, cx, cy, rotation)
  }

  private draw_scatter(project: (lon: number, lat: number) => Point2D,
                      scale: number, cx: number, cy: number, rotation: number): void {
    if (!this.ctx || !this.model.scatter_data.length) return
    
    const ctx = this.ctx
    
    for (const point of this.model.scatter_data as ScatterPoint[]) {
      const rotated_lon = point.lon - rotation
      const p = project(rotated_lon, point.lat)
      const px = cx + p.x * scale
      const py = cy - p.y * scale
      
      ctx.beginPath()
      ctx.arc(px, py, point.size || 5, 0, 2 * Math.PI)
      ctx.fillStyle = point.color || this.model.scatter_color
      ctx.fill()
      ctx.strokeStyle = point.border_color || '#000000'
      ctx.lineWidth = point.border_width || 1
      ctx.stroke()
    }
  }

  private draw_lines(project: (lon: number, lat: number) => Point2D,
                    scale: number, cx: number, cy: number, rotation: number): void {
    if (!this.ctx || !this.model.line_data.length) return
    
    const ctx = this.ctx
    
    for (const line of this.model.line_data as Line[]) {
      ctx.strokeStyle = line.color || this.model.line_color
      ctx.lineWidth = line.width || 2
      ctx.beginPath()
      
      for (let i = 0; i < line.coords.length; i++) {
        const rotated_lon = line.coords[i][0] - rotation
        const p = project(rotated_lon, line.coords[i][1])
        const px = cx + p.x * scale
        const py = cy - p.y * scale
        
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      
      ctx.stroke()
    }
  }

  private update_tooltip(): void {
    if (!this.tooltip_el || !this.canvas || !this.ctx) return
    
    // Check scatter points
    for (const point of this.model.scatter_data as ScatterPoint[]) {
      const screen_pos = this.get_screen_coords(point.lon, point.lat)
      if (screen_pos) {
        const dist = Math.sqrt((this.mouse_x - screen_pos.x) ** 2 + 
                              (this.mouse_y - screen_pos.y) ** 2)
        if (dist < (point.size || 5) + 3) {
          this.tooltip_el.innerHTML = point.label || `(${point.lon.toFixed(2)}, ${point.lat.toFixed(2)})`
          this.tooltip_el.style.display = 'block'
          this.tooltip_el.style.left = `${this.mouse_x + 15}px`
          this.tooltip_el.style.top = `${this.mouse_y - 30}px`
          return
        }
      }
    }
    
    // Check grid values
    const imageData = this.ctx.getImageData(this.mouse_x, this.mouse_y, 1, 1)
    const pixel = imageData.data
    
    if (pixel[0] > 10 || pixel[1] > 10 || pixel[2] > 10) {
      const palette = getPalette(this.model.palette)
      const {vmin, vmax} = getValueRange(this.model.values, this.model.vmin, this.model.vmax)
      
      let closest_idx = 0
      let min_distance = Infinity
      
      for (let i = 0; i < palette.length; i++) {
        const pal_r = parseInt(palette[i].slice(1, 3), 16)
        const pal_g = parseInt(palette[i].slice(3, 5), 16)
        const pal_b = parseInt(palette[i].slice(5, 7), 16)
        
        const distance = Math.abs(pal_r - pixel[0]) + Math.abs(pal_g - pixel[1]) + 
                        Math.abs(pal_b - pixel[2])
        
        if (distance < min_distance) {
          min_distance = distance
          closest_idx = i
        }
      }
      
      const value = vmin + (closest_idx / (palette.length - 1)) * (vmax - vmin)
      
      this.tooltip_el.innerHTML = `Value: ${value.toFixed(2)}`
      this.tooltip_el.style.display = 'block'
      this.tooltip_el.style.left = `${this.mouse_x + 15}px`
      this.tooltip_el.style.top = `${this.mouse_y - 30}px`
    } else {
      this.tooltip_el.style.display = 'none'
    }
  }

  private get_screen_coords(lon: number, lat: number): {x: number, y: number} | null {
    const width = this.model.width ?? 1000
    const height = this.model.height ?? 600
    const project = getProjection(this.model.projection)
    const scale = getProjectionScale(this.model.projection, width, height) * this.model.zoom
    const cx = width / 2 + this.pan_offset_x
    const cy = height / 2 + this.pan_offset_y
    const rotation = this.model.rotation
    
    const rotated_lon = lon - rotation
    const p = project(rotated_lon, lat)
    
    return {
      x: cx + p.x * scale,
      y: cy - p.y * scale
    }
  }
}

export namespace GriddedProjection {
  export type Attrs = p.AttrsOf<Props>

  export type Props = LayoutDOM.Props & {
    lons: p.Property<number[]>
    lats: p.Property<number[]>
    values: p.Property<number[]>
    n_lat: p.Property<number>
    n_lon: p.Property<number>
    projection: p.Property<string>
    palette: p.Property<string>
    vmin: p.Property<number>
    vmax: p.Property<number>
    nan_color: p.Property<string>
    rotation: p.Property<number>
    zoom: p.Property<number>
    show_coastlines: p.Property<boolean>
    coastline_color: p.Property<string>
    coastline_width: p.Property<number>
    coast_lons: p.Property<any[]>
    coast_lats: p.Property<any[]>
    show_countries: p.Property<boolean>
    country_color: p.Property<string>
    country_width: p.Property<number>
    country_lons: p.Property<any[]>
    country_lats: p.Property<any[]>
    enable_hover: p.Property<boolean>
    scatter_data: p.Property<any[]>
    scatter_color: p.Property<string>
    line_data: p.Property<any[]>
    line_color: p.Property<string>
    show_colorbar: p.Property<boolean>
    colorbar_title: p.Property<string>
    background_color: p.Property<string>
    colorbar_text_color: p.Property<string>
  }
}

export interface GriddedProjection extends GriddedProjection.Attrs {}

export class GriddedProjection extends LayoutDOM {
  declare properties: GriddedProjection.Props
  declare __view_type__: GriddedProjectionView

  constructor(attrs?: Partial<GriddedProjection.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = GriddedProjectionView

    this.define<GriddedProjection.Props>(({Any, Bool, Float, Int, List, String}) => ({
      lons: [ List(Float), [] ],
      lats: [ List(Float), [] ],
      values: [ List(Float), [] ],
      n_lat: [ Int, 30 ],
      n_lon: [ Int, 60 ],
      projection: [ String, 'natural_earth' ],
      palette: [ String, 'Turbo256' ],
      vmin: [ Float, NaN ],
      vmax: [ Float, NaN ],
      nan_color: [ String, '#808080' ],
      rotation: [ Float, 0 ],
      zoom: [ Float, 1.0 ],
      show_coastlines: [ Bool, true ],
      coastline_color: [ String, '#000000' ],
      coastline_width: [ Float, 1.2 ],
      coast_lons: [ List(Any), [] ],
      coast_lats: [ List(Any), [] ],
      show_countries: [ Bool, false ],
      country_color: [ String, '#333333' ],
      country_width: [ Float, 0.4 ],
      country_lons: [ List(Any), [] ],
      country_lats: [ List(Any), [] ],
      enable_hover: [ Bool, true ],
      scatter_data: [ List(Any), [] ],
      scatter_color: [ String, '#ff0000' ],
      line_data: [ List(Any), [] ],
      line_color: [ String, '#0000ff' ],
      show_colorbar: [ Bool, true ],
      colorbar_title: [ String, 'Value' ],
      background_color: [ String, '#0a0a0a' ],
      colorbar_text_color: [ String, '#ffffff' ],
    }))
  }
}
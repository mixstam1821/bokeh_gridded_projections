"""
Animated GriddedProjection - CustomJS Version
==============================================
12 years of gridded data with time slider and play button.
Pure client-side JavaScript - no server required.

Run with: python animated_gridded_customjs.py
"""

import numpy as np
from bokeh.plotting import show
from bokeh.layouts import column, row
from bokeh.models import Slider, Button, Div, CustomJS
from gridded_projection_py import GriddedProjection

# ═══════════════════════════════════════════════════════════════════════════════
# 1. GENERATE 12 YEARS OF DATA
# ═══════════════════════════════════════════════════════════════════════════════

N_YEARS = 12
lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)

# Generate data for each year with evolving patterns
yearly_data = []
for year in range(N_YEARS):
    # Base pattern with time evolution
    time_factor = year / N_YEARS * 2 * np.pi
    
    values = (
        10 * np.sin(np.radians(lats_grid)) +
        6 * np.sin(2 * np.radians(lons_grid) + time_factor) +
        3 * np.sin(4 * np.radians(lats_grid + lons_grid) + time_factor * 0.5) +
        2 * np.cos(np.radians(lons_grid) * 3 - time_factor)
    )
    yearly_data.append(values.flatten().tolist())

# ═══════════════════════════════════════════════════════════════════════════════
# 2. CREATE MAP MODEL
# ═══════════════════════════════════════════════════════════════════════════════

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=yearly_data[0],  # Start with year 0
    n_lat=60,
    n_lon=120,
    projection='robinson',
    palette='Spectral',
    colorbar_title='Year 2013',
    width=900,
    height=500,
        background_color="#f0f0f0",
    colorbar_text_color="#333333",
)

# Store all yearly data in the model's tags for JS access
proj.tags = yearly_data

# ═══════════════════════════════════════════════════════════════════════════════
# 3. CREATE WIDGETS
# ═══════════════════════════════════════════════════════════════════════════════

year_slider = Slider(
    start=0,
    end=N_YEARS - 1,
    value=0,
    step=1,
    title="Year",
    width=700,
    bar_color="#ff6b6b",
    
)

play_button = Button(
    label="▶ Play",
    button_type="success",
    width=100,
)

title_div = Div(text="""
<div style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 16px 24px;
    margin-bottom: 15px;
">
    <h2 style="margin:0; color:white; font-weight:600; font-size:22px;">
        🌍 Climate Data Animation (2013-2024)
    </h2>
    <p style="margin:6px 0 0; color:#f0f0f0; font-size:14px;">
        Use the slider or play button to animate through 12 years of data
    </p>
</div>
""", width=900)

# ═══════════════════════════════════════════════════════════════════════════════
# 4. CUSTOMJS CALLBACKS
# ═══════════════════════════════════════════════════════════════════════════════

# Slider callback: update map when slider changes
slider_callback = CustomJS(args=dict(proj=proj, slider=year_slider), code="""
    const year_idx = Math.round(slider.value);
    const year_label = 2013 + year_idx;
    
    // Update map data from stored tags
    proj.values = proj.tags[year_idx];
    proj.colorbar_title = 'Year ' + year_label;

""")

year_slider.js_on_change('value', slider_callback)

# Play button callback: start/stop animation
play_callback = CustomJS(args=dict(
    slider=year_slider,
    button=play_button,
    proj=proj,
    n_years=N_YEARS
), code="""
    // Animation interval stored on button itself
    if (button.interval_id === undefined) {
        button.interval_id = null;
        button.is_playing = false;
    }
    
    if (button.is_playing) {
        // Stop animation
        if (button.interval_id !== null) {
            clearInterval(button.interval_id);
            button.interval_id = null;
        }
        button.label = "▶ Play";
        button.button_type = "success";
        button.is_playing = false;
    } else {
        // Start animation
        button.interval_id = setInterval(function() {
            let new_year = slider.value + 1;
            if (new_year >= n_years) {
                new_year = 0;
            }
            slider.value = new_year;
            
            // Update map directly (slider callback will also fire)
            const year_idx = Math.round(new_year);
            const year_label = 2013 + year_idx;
            proj.values = proj.tags[year_idx];
            proj.colorbar_title = 'Year ' + year_label;
            
        }, 500);  // 500ms = 0.5 sec per year
        
        button.label = "⏸ Pause";
        button.button_type = "warning";
        button.is_playing = true;
    }
""")

play_button.js_on_click(play_callback)

# ═══════════════════════════════════════════════════════════════════════════════
# 5. LAYOUT
# ═══════════════════════════════════════════════════════════════════════════════

controls = row(play_button, year_slider, spacing=10)

layout = column(
    title_div,
    controls,
    proj,
    sizing_mode='fixed',styles = {"border": "1px solid #faa4a4", "border-radius": "12px","background": "#f0f0f0", "width": "1100px", "height": "700px"}
)

show(layout)
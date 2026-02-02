"""
Animated GriddedProjection - Bokeh Server Version
==================================================
12 years of gridded data with time slider and play button.

Run with: bokeh serve animated_gridded_server.py
"""

import numpy as np
from bokeh.io import curdoc
from bokeh.layouts import column, row
from bokeh.models import Slider, Button, Div
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
    projection='mollweide',
    palette='terrain',
    colorbar_title='Year 2013',
    width=900,
    height=500,
    background_color="#000000",
)

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
    
    styles={"color": "white"}
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
# 4. CALLBACKS
# ═══════════════════════════════════════════════════════════════════════════════

# Animation state
animation_callback = None
is_playing = False


def update_year(attr, old, new):
    """Update map when slider changes."""
    year_idx = int(year_slider.value)
    proj.values = yearly_data[year_idx]
    proj.colorbar_title = f'Year {2013 + year_idx}'



def animate():
    """Advance to next year."""
    new_year = year_slider.value + 1
    if new_year >= N_YEARS:
        new_year = 0
    year_slider.value = new_year


def toggle_play():
    """Start/stop animation."""
    global animation_callback, is_playing
    
    if is_playing:
        # Stop animation
        if animation_callback is not None:
            curdoc().remove_periodic_callback(animation_callback)
            animation_callback = None
        play_button.label = "▶ Play"
        play_button.button_type = "success"
        is_playing = False
    else:
        # Start animation
        animation_callback = curdoc().add_periodic_callback(animate, 500)  # 500ms = 0.5 sec per year
        play_button.label = "⏸ Pause"
        play_button.button_type = "warning"
        is_playing = True


# Attach callbacks
year_slider.on_change('value', update_year)
play_button.on_click(toggle_play)

# ═══════════════════════════════════════════════════════════════════════════════
# 5. LAYOUT
# ═══════════════════════════════════════════════════════════════════════════════

controls = row(play_button, year_slider, spacing=10)

layout = column(
    title_div,
    controls,
    proj,
    sizing_mode='fixed',styles = {"border": "1px solid #faa4a4", "border-radius": "12px","background": "#000000", "width": "1100px", "height": "700px"}
)

curdoc().add_root(layout)
curdoc().title = "Animated Climate Data"
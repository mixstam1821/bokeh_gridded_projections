"""
Interactive GriddedProjection Dashboard - Bokeh Server Version
===============================================================
Run with: bokeh serve dashboard_server.py

Requirements
------------
* bokeh
* numpy
* The GriddedProjection custom model (gridded_projection_py.py + the
  compiled gridded_projection.ts) must be importable from the same directory.
"""

import numpy as np
from bokeh.layouts import column, row
from bokeh.models import (
    Select, CheckboxGroup, ColorPicker, Div
)
from bokeh.io import curdoc

from gridded_projection_py import GriddedProjection

# ═══════════════════════════════════════════════════════════════════════════════
# 1.  DATA SAMPLES  –  four "natural-looking" global fields
# ═══════════════════════════════════════════════════════════════════════════════

N_LON, N_LAT = 180, 90          # grid resolution (lon × lat)

_lons1d = np.linspace(-180, 180, N_LON)
_lats1d = np.linspace(-90, 90, N_LAT)
_LON, _LAT = np.meshgrid(_lons1d, _lats1d)
_lon_r, _lat_r = np.radians(_LON), np.radians(_LAT)


def _sample_temperature():
    """
    Synthetic global surface-temperature-like field.
    Warm tropics, cold poles, slight land-sea contrast via a cosine bump.
    """
    base = 15.0 - 40.0 * (_lat_r ** 2) / (np.pi / 2) ** 2          # parabolic pole cooling
    land  = 5.0 * np.cos(2.5 * _lon_r) * np.cos(1.8 * _lat_r)      # zonal "continent" warmth
    noise = 2.0 * np.sin(7 * _lon_r) * np.sin(5 * _lat_r)           # small-scale texture
    return base + land + noise


def _sample_pressure():
    """
    Synthetic sea-level-pressure-like field.
    Alternating high/low centres reminiscent of the subtropical highs and
    polar lows, with a slight hemispheric asymmetry.
    """
    # Three subtropical high centres (roughly correct positions)
    highs = (
          1013 + 18 * np.exp(-(((_lon_r - np.radians(-30))**2) / 0.4 + ((_lat_r - np.radians(30))**2) / 0.25))
              + 15 * np.exp(-(((_lon_r - np.radians(130))**2) / 0.5 + ((_lat_r - np.radians(25))**2) / 0.22))
              + 14 * np.exp(-(((_lon_r - np.radians(-120))**2) / 0.45 + ((_lat_r - np.radians(28))**2) / 0.24))
    )
    # Polar low influence
    polar = -12 * np.exp(-((_lat_r - np.radians(55))**2) / 0.18)
    polar -= 10 * np.exp(-((_lat_r + np.radians(60))**2) / 0.20)
    # Equatorial low band (ITCZ-ish)
    itcz = -6 * np.exp(-(_lat_r**2) / 0.04)
    return highs + polar + itcz


def _sample_wind_speed():
    """
    Synthetic global wind-speed field.
    Jet streams at ~±35° lat, trade-wind bands in the tropics, calm subtropics.
    """
    # Jet streams (narrow bands of high wind)
    jets = (12 * np.exp(-((_lat_r - np.radians(38))**2) / 0.03)
            + 10 * np.exp(-((_lat_r + np.radians(42))**2) / 0.035))
    # Trade winds (broader, lower)
    trades = 7 * np.cos(_lon_r * 0.5) * np.exp(-((_lat_r)**2) / 0.12)
    # Calm subtropics (dip)
    calm = -4 * (np.exp(-((_lat_r - np.radians(25))**2) / 0.06)
                 + np.exp(-((_lat_r + np.radians(25))**2) / 0.06))
    # Polar westerlies
    westerlies = 6 * np.exp(-((_lat_r - np.radians(55))**2) / 0.08) * (1 + 0.3 * np.sin(2 * _lon_r))
    return np.clip(jets + trades + calm + westerlies + 3, 0, None)   # speed ≥ 0


def _sample_ocean_depth():
    """
    Synthetic bathymetry / elevation field.
    Deep ocean basins, mid-ocean ridges along ~0° and ~180° lon, shallow
    continental shelves near the "land" longitudes, and mountain ranges.
    """
    # Ocean basins (deep negative)
    pac  = -4500 * np.exp(-(((_lon_r - np.radians(170))**2) / 1.2 + ((_lat_r)**2) / 0.8))
    atl  = -3800 * np.exp(-(((_lon_r - np.radians(-35))**2) / 0.6 + ((_lat_r)**2) / 1.0))
    ind  = -3200 * np.exp(-(((_lon_r - np.radians(80))**2)  / 0.5 + ((_lat_r + np.radians(15))**2) / 0.4))
    # Mid-ocean ridges (shallower lines through basins)
    ridge = 1800 * np.exp(-((np.abs(_lon_r - np.radians(-30)) - 0.05)**2) / 0.01) * np.exp(-(_lat_r**2)/2.0)
    # Continental shelves / land masses (positive near "continents")
    land  = 2000 * np.exp(-(((_lon_r - np.radians(30))**2) / 0.3 + ((_lat_r - np.radians(40))**2) / 0.35))
    land += 1800 * np.exp(-(((_lon_r - np.radians(-100))**2) / 0.4 + ((_lat_r - np.radians(35))**2) / 0.3))
    land += 1500 * np.exp(-(((_lon_r - np.radians(110))**2) / 0.35 + ((_lat_r - np.radians(20))**2) / 0.25))
    # Mountain peaks
    mtn = 3500 * np.exp(-(((np.radians(_LON) - np.radians(75))**2) / 0.02 + ((_lat_r - np.radians(32))**2) / 0.01))  # Himalayas-ish
    return pac + atl + ind + ridge + land + mtn


SAMPLES = {
    "Sample 1 – Temperature (°C)":  _sample_temperature(),
    "Sample 2 – Pressure (hPa)":    _sample_pressure(),
    "Sample 3 – Wind Speed (m/s)":  _sample_wind_speed(),
    "Sample 4 – Bathymetry (m)":    _sample_ocean_depth(),
}

# Flatten lons/lats once; value arrays are built per-sample below.
FLAT_LONS   = _LON.flatten().tolist()
FLAT_LATS   = _LAT.flatten().tolist()

# Store sample names and values
SAMPLE_NAMES  = list(SAMPLES.keys())
SAMPLE_VALUES = [SAMPLES[k].flatten().tolist() for k in SAMPLE_NAMES]

# ═══════════════════════════════════════════════════════════════════════════════
# 2.  WIDGET DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

PROJECTIONS = [
    "natural_earth", "mollweide", "robinson", "plate_carree", "sinusoidal",
    "eckert4", "winkel_tripel", "miller", "mercator", "albers_equal_area",
]

PALETTES = [
    "Turbo256", "Viridis256", "Plasma256", "Inferno256", "Magma256", "Cividis256",
    "terrain", "YlOrRd", "RdYlBu", "bwr", "Spectral", "RdYlGn", "PiYG", "BuPu",
    "nipy_spectral", "coolwarm", "cool", "seismic", "winter", "summer", "autumn",
    "spring", "rainbow", "gist_earth"
]

projection_select = Select(
    title="Projection",
    value="robinson",
    options=PROJECTIONS,
    width=220,
    styles={"font-size": "13px"}
)

palette_select = Select(
    title="Palette",
    value="Spectral",
    options=PALETTES,
    width=220,
    styles={"font-size": "13px"}
)

data_select = Select(
    title="Data Sample",
    value="0",
    options=[(str(i), name) for i, name in enumerate(SAMPLE_NAMES)],
    width=220,
    styles={"font-size": "13px"}
)

# Checkboxes: 0 = coastlines, 1 = countries
overlay_checkboxes = CheckboxGroup(
    labels=["Show Coastlines", "Show Countries"],
    active=[0, 1],
    styles={"font-size": "13px"}
)

coastline_picker = ColorPicker(
    title="Coastline Color",
    color="#000000",
    width=70,
    styles={"font-size": "13px"}
)

country_picker = ColorPicker(
    title="Country Border Color",
    color="#000000",
    width=70,
    styles={"font-size": "13px"}
)

# ═══════════════════════════════════════════════════════════════════════════════
# 3.  THE MAP MODEL
# ═══════════════════════════════════════════════════════════════════════════════

map_model = GriddedProjection(
    lons=FLAT_LONS,
    lats=FLAT_LATS,
    values=SAMPLE_VALUES[0],
    n_lat=N_LAT,
    n_lon=N_LON,
    projection="robinson",
    palette="Spectral",
    show_coastlines=True,
    coastline_color="#000000",
    coastline_width=0.6,
    show_countries=True,
    country_color="#000000",
    country_width=0.5,
    background_color="#f0f0f0",
    colorbar_text_color="#494949",
    colorbar_title="Sample 1 – Temperature (°C)",
    width=900,
    height=520,
)

# ═══════════════════════════════════════════════════════════════════════════════
# 4.  PYTHON CALLBACKS (replacing CustomJS)
# ═══════════════════════════════════════════════════════════════════════════════

def update_map(attr, old, new):
    """
    Update the map whenever any widget changes.
    """
    # Get the selected data index
    idx = int(data_select.value)
    
    # Update projection and palette
    map_model.projection = projection_select.value
    map_model.palette = palette_select.value
    
    # Update data values and colorbar title
    map_model.values = SAMPLE_VALUES[idx]
    map_model.colorbar_title = SAMPLE_NAMES[idx]
    
    # Update overlay visibility
    map_model.show_coastlines = 0 in overlay_checkboxes.active
    map_model.show_countries = 1 in overlay_checkboxes.active
    
    # Update colors
    map_model.coastline_color = coastline_picker.color
    map_model.country_color = country_picker.color
    
    # Nudge rotation to force a full re-render
    map_model.rotation = map_model.rotation + 0.0000001


# Attach Python callbacks to all widgets
projection_select.on_change("value", update_map)
palette_select.on_change("value", update_map)
data_select.on_change("value", update_map)
overlay_checkboxes.on_change("active", update_map)
coastline_picker.on_change("color", update_map)
country_picker.on_change("color", update_map)

# ═══════════════════════════════════════════════════════════════════════════════
# 5.  LAYOUT  &  ADD TO DOCUMENT
# ═══════════════════════════════════════════════════════════════════════════════

title_div = Div(text="""
<div style="
    background: linear-gradient(135deg, #dbdbdb 0%, #faa4a4 100%);
    border-radius: 12px 12px 0 0;
    padding: 18px 28px;
    border-bottom: 1px solid #faa4a4;
">
    <h2 style="margin:0; color:#0f0f0f; font-weight:600; font-size:20px; letter-spacing:0.3px;">
        🌍 Global Projection Explorer
    </h2>
    <p style="margin:6px 0 0; color:#000000; font-size:13px; font-weight:400;">
        Switch projections, palettes and data fields instantly.
    </p>
</div>
""", width=400)

layout = row(
    column(
        title_div,
        projection_select,
        palette_select,
        data_select,
        overlay_checkboxes,
        coastline_picker,
        country_picker,
    ),
    map_model,
    styles={
        "border": "1px solid #faa4a4",
        "border-radius": "12px",
        "background": "#f0f0f0",
        "width": "1500px"
    }
)

# Add the layout to the current document
curdoc().add_root(layout)
curdoc().title = "Global Projection Explorer"
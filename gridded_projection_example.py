########### mollweide ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='mollweide',
    palette='terrain',
)
show(proj)
########### sinusoidal ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='sinusoidal',
    palette='YlOrRd', zoom = 0.8
)
show(proj)
########### plate_carree ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='plate_carree',
    palette='bwr', zoom = 0.8
)
show(proj)
########### albers_equal_area ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='albers_equal_area',
    palette='nipy_spectral', zoom = 0.8, rotation = 90
)
show(proj)
########### robinson ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='robinson',
    palette='Spectral'
)
show(proj)

########### eckert4 ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='eckert4',
    palette='RdYlBu', zoom = 0.8
)
show(proj)

########### mercator ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='mercator',zoom = 0.7,
    palette='PiYG',
)
show(proj)

########### natural_earth ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='natural_earth',
    palette='BuPu',
    background_color='#d6d6d6',
    colorbar_text_color='#000000',

)
show(proj)
########### miller ###########
from gridded_projection_py import GriddedProjection
from bokeh.plotting import show, output_file
import numpy as np

lons = np.linspace(-180, 180, 120)
lats = np.linspace(-90, 90, 60)
lons_grid, lats_grid = np.meshgrid(lons, lats)
values = ( 10 * np.sin(np.radians(lats_grid)) + 6  * np.sin(2 * np.radians(lons_grid)) + 3  * np.sin(4 * np.radians(lats_grid + lons_grid)) )

proj = GriddedProjection(
    lons=lons_grid.flatten().tolist(),
    lats=lats_grid.flatten().tolist(),
    values=values.flatten().tolist(),
    n_lat=60,
    n_lon=120,
    projection='miller',
    palette='inferno', zoom = 0.9,
    show_countries = True
)
show(proj)


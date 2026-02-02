# """
# GriddedProjection - Python wrapper for gridded projection visualization
# """
# from bokeh.core.properties import Int, Float, String, List, Bool, Any
# from bokeh.models import LayoutDOM
# import numpy as np

# class GriddedProjection(LayoutDOM):
#     """Map projection with gridded data"""
    
#     __implementation__ = "gridded_projection.ts"
    
#     lons = List(Float)
#     lats = List(Float)
#     values = List(Float)
#     n_lat = Int(30)
#     n_lon = Int(60)
#     projection = String("natural_earth")
#     palette = String("Turbo256")
#     vmin = Float(float('nan'))
#     vmax = Float(float('nan'))
#     nan_color = String("#808080")
#     rotation = Float(0)
#     zoom = Float(1.0)
#     show_coastlines = Bool(True)
#     coastline_color = String("#000000")
#     coastline_width = Float(1.2)
#     coast_lons = List(Any, default=[])
#     coast_lats = List(Any, default=[])
#     enable_hover = Bool(True)
#     scatter_data = List(Any, default=[])
#     scatter_color = String("#ff0000")
#     line_data = List(Any, default=[])
#     line_color = String("#0000ff")
#     show_colorbar = Bool(True)
#     colorbar_title = String("Value")
#     background_color = String("#0a0a0a")
#     colorbar_text_color = String("#ffffff")
    
#     def __init__(self, **kwargs):
#         # Auto-load coastlines if show_coastlines=True and coast_lons is empty
#         if kwargs.get('show_coastlines', True) and not kwargs.get('coast_lons'):
#             coast_lons_data, coast_lats_data = self._load_coastlines()
#             if coast_lons_data:
#                 kwargs['coast_lons'] = coast_lons_data
#                 kwargs['coast_lats'] = coast_lats_data
        
#         super().__init__(**kwargs)
    
#     @staticmethod
#     def _load_coastlines():
#         """Load coastline data from cartopy"""
#         coast_lons_data = []
#         coast_lats_data = []
        
#         try:
#             import cartopy.feature as cfeature
#             from shapely.geometry import LineString, MultiLineString
            
#             # Load Natural Earth coastlines (110m resolution)
#             coastlines = cfeature.NaturalEarthFeature('physical', 'coastline', '110m')
            
#             for geom in coastlines.geometries():
#                 if isinstance(geom, LineString):
#                     coords = np.array(geom.coords)
#                     coast_lons_data.extend(coords[:, 0].tolist() + [None])
#                     coast_lats_data.extend(coords[:, 1].tolist() + [None])
#                 elif isinstance(geom, MultiLineString):
#                     for line in geom.geoms:
#                         coords = np.array(line.coords)
#                         coast_lons_data.extend(coords[:, 0].tolist() + [None])
#                         coast_lats_data.extend(coords[:, 1].tolist() + [None])
            
#             print(f"Loaded {len(coast_lons_data)} coastline points")
            
#         except ImportError as e:
#             print(f"Warning: cartopy not available ({e})")
#             print("Install with: pip install cartopy")
#         except Exception as e:
#             print(f"Warning: Could not load coastlines ({e})")
        
#         return coast_lons_data, coast_lats_data




"""
GriddedProjection - Python wrapper for gridded projection visualization
"""
from bokeh.core.properties import Int, Float, String, List, Bool, Any
from bokeh.models import LayoutDOM

class GriddedProjection(LayoutDOM):
    """Map projection with gridded data"""
    
    __implementation__ = "gridded_projection.ts"
    
    lons = List(Float)
    lats = List(Float)
    values = List(Float)
    n_lat = Int(30)
    n_lon = Int(60)
    projection = String("natural_earth")
    palette = String("Turbo256")
    vmin = Float(float('nan'))
    vmax = Float(float('nan'))
    nan_color = String("#808080")
    rotation = Float(0)
    zoom = Float(1.0)
    show_coastlines = Bool(True)
    coastline_color = String("#000000")
    coastline_width = Float(1.2)
    coast_lons = List(Any, default=[])
    coast_lats = List(Any, default=[])
    show_countries = Bool(False)
    country_color = String("#333333")
    country_width = Float(0.4)
    country_lons = List(Any, default=[])
    country_lats = List(Any, default=[])
    enable_hover = Bool(True)
    scatter_data = List(Any, default=[])
    scatter_color = String("#ff0000")
    line_data = List(Any, default=[])
    line_color = String("#0000ff")
    show_colorbar = Bool(True)
    colorbar_title = String("Value")
    background_color = String("#0a0a0a")
    colorbar_text_color = String("#ffffff")
    
    def __init__(self, **kwargs):
        # Auto-load coastlines if show_coastlines=True and coast_lons is empty
        if kwargs.get('show_coastlines', True) and not kwargs.get('coast_lons'):
            coast_lons_data, coast_lats_data = self._load_coastlines_bundled()
            if coast_lons_data:
                kwargs['coast_lons'] = coast_lons_data
                kwargs['coast_lats'] = coast_lats_data
        
        # Auto-load countries if show_countries=True and country_lons is empty
        if kwargs.get('show_countries', False) and not kwargs.get('country_lons'):
            country_lons_data, country_lats_data = self._load_countries_bundled()
            if country_lons_data:
                kwargs['country_lons'] = country_lons_data
                kwargs['country_lats'] = country_lats_data
        
        super().__init__(**kwargs)
    
    @staticmethod
    def _load_coastlines_bundled():
        """Load pre-bundled coastline data (instant!)"""
        try:
            from coastline_data import COAST_LONS, COAST_LATS
            return COAST_LONS, COAST_LATS
        except ImportError:
            print("Warning: coastline_data.py not found")
            print("Generate it by running: python generate_coastline_data.py")
            return [], []
    
    @staticmethod
    def _load_countries_bundled():
        """Load pre-bundled country boundary data (instant!)"""
        try:
            from countries_data import COUNTRY_LONS, COUNTRY_LATS
            return COUNTRY_LONS, COUNTRY_LATS
        except ImportError:
            print("Warning: countries_data.py not found")
            print("Generate it by running: python generate_countries_data.py")
            return [], []
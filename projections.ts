// /**
//  * Projection utilities for geographic visualizations
//  */

// export interface Point2D {
//   x: number
//   y: number

// }


// /**
//  * Mollweide projection
//  */
// export function projectMollweide(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
  
//   let theta = phi
//   for (let i = 0; i < 10; i++) {
//     const dtheta = -(theta + Math.sin(theta) - Math.PI * Math.sin(phi)) / (1 + Math.cos(theta))
//     theta += dtheta
//     if (Math.abs(dtheta) < 1e-6) break
//   }
  
//   const x = (2 * Math.sqrt(2) / Math.PI) * lambda * Math.cos(theta / 2)
//   const y = Math.sqrt(2) * Math.sin(theta / 2)
  
//   return {x, y}
// }

// /**
//  * Natural Earth projection
//  */
// export function projectNaturalEarth(lon: number, lat: number): Point2D {
//   const lplam = lon * Math.PI / 180
//   const lpphi = lat * Math.PI / 180
  
//   const A0 = 0.8707
//   const A1 = -0.131979
//   const A2 = -0.013791
//   const A3 = 0.003971
//   const A4 = -0.001529
//   const B0 = 1.007226
//   const B1 = 0.015085
//   const B2 = -0.044475
//   const B3 = 0.028874
//   const B4 = -0.005916
  
//   const phi2 = lpphi * lpphi
//   const phi4 = phi2 * phi2
  
//   const x = lplam * (A0 + phi2 * (A1 + phi2 * (A2 + phi4 * phi2 * (A3 + phi2 * A4))))
//   const y = lpphi * (B0 + phi2 * (B1 + phi4 * (B2 + B3 * phi2 + B4 * phi4)))
  
//   return {x, y}
// }

// /**
//  * Robinson projection
//  */
// export function projectRobinson(lon: number, lat: number): Point2D {
//   // Robinson projection lookup tables
//   const ROBINSON_AA = [
//     1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730, 0.9600, 0.9427,
//     0.9216, 0.8962, 0.8679, 0.8350, 0.7986, 0.7597, 0.7186, 0.6732,
//     0.6213, 0.5722, 0.5322
//   ]
  
//   const ROBINSON_BB = [
//     0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100, 0.3720, 0.4340,
//     0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936,
//     0.9394, 0.9761, 1.0000
//   ]
  
//   const lplam = lon * Math.PI / 180
//   let lpphi = lat * Math.PI / 180
  
//   const sign = lpphi < 0 ? -1 : 1
//   lpphi = Math.abs(lpphi)
  
//   const phi_deg = lpphi * 180 / Math.PI
//   const i = Math.floor(phi_deg / 5)
//   const i_clamped = Math.min(i, 17)
  
//   const dphi = (phi_deg - i_clamped * 5) / 5
  
//   const aa = ROBINSON_AA[i_clamped] + (ROBINSON_AA[i_clamped + 1] - ROBINSON_AA[i_clamped]) * dphi
//   const bb = ROBINSON_BB[i_clamped] + (ROBINSON_BB[i_clamped + 1] - ROBINSON_BB[i_clamped]) * dphi
  
//   const x = 0.8487 * aa * lplam
//   const y = 1.3523 * bb * sign
  
//   return {x, y}
// }

// /**
//  * Plate Carrée (Equirectangular) projection
//  */
// export function projectPlateCarree(lon: number, lat: number): Point2D {
//   const x = lon * Math.PI / 180
//   const y = lat * Math.PI / 180
//   return {x, y}
// }



// /**
//  * Sinusoidal projection (Sanson-Flamsteed)
//  * Equal-area pseudocylindrical
//  */
// export function projectSinusoidal(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
  
//   const x = lambda * Math.cos(phi)
//   const y = phi
  
//   return { x, y }
// }

// /**
//  * Eckert IV projection
//  * Equal-area pseudocylindrical
//  */
// export function projectEckertIV(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
  
//   const C = 2 + Math.PI / 2
//   let theta = phi / 2
  
//   // Newton-Raphson iteration
//   for (let i = 0; i < 10; i++) {
//     const delta = -(theta + Math.sin(theta) * Math.cos(theta) + 2 * Math.sin(theta) - C * Math.sin(phi)) /
//                    (2 * Math.cos(theta) * (1 + Math.cos(theta)))
//     theta += delta
//     if (Math.abs(delta) < 1e-7) break
//   }
  
//   const x = 2 / Math.sqrt(Math.PI * (4 + Math.PI)) * lambda * (1 + Math.cos(theta))
//   const y = 2 * Math.sqrt(Math.PI / (4 + Math.PI)) * Math.sin(theta)
  
//   return { x, y }
// }


// /**
//  * Winkel Tripel projection
//  * Compromise projection used by National Geographic
//  */
// export function projectWinkelTripel(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
//   const phi1 = 50.467 * Math.PI / 180 // Standard parallel
  
//   // Aitoff portion
//   const alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2))
//   const sinc_alpha = alpha === 0 ? 1 : Math.sin(alpha) / alpha
  
//   const x_aitoff = 2 * Math.cos(phi) * Math.sin(lambda / 2) / sinc_alpha
//   const y_aitoff = Math.sin(phi) / sinc_alpha
  
//   // Equirectangular portion
//   const x_eqr = lambda * Math.cos(phi1)
//   const y_eqr = phi
  
//   // Average
//   const x = (x_aitoff + x_eqr) / 2
//   const y = (y_aitoff + y_eqr) / 2
  
//   return { x, y }
// }


// /**
//  * Miller Cylindrical projection
//  * Compromise cylindrical projection
//  */
// export function projectMiller(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
  
//   const x = lambda
//   const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))
  
//   return { x, y }
// }
// /**
//  * Mercator projection
//  * Conformal cylindrical projection
//  */
// export function projectMercator(lon: number, lat: number): Point2D {
//   const lambda = lon * Math.PI / 180
//   const phi = lat * Math.PI / 180
  
//   // Clamp latitude to avoid infinity
//   const clampedPhi = Math.max(-85 * Math.PI / 180, Math.min(85 * Math.PI / 180, phi))
  
//   const x = lambda
//   const y = Math.log(Math.tan(Math.PI / 4 + clampedPhi / 2))
  
//   return { x, y }
// }




// /**
//  * Get projection function by name
//  */
// export function getProjection(name: string): (lon: number, lat: number) => Point2D {
//   switch(name) {
//     case 'mollweide':
//       return projectMollweide
//     case 'natural_earth':
//       return projectNaturalEarth
//     case 'robinson':
//       return projectRobinson
//     case 'plate_carree':
//       return projectPlateCarree
//     case 'sinusoidal':
//       return projectSinusoidal
//     case 'eckert4':
//       return projectEckertIV
//     case 'winkel_tripel':
//       return projectWinkelTripel
    

//     case 'miller':
//       return projectMiller
//     case 'mercator':
//       return projectMercator


//     default:
//       return projectNaturalEarth
//   }
// }







// /**
//  * Get scale factor for projection
//  */
// export function getProjectionScale(name: string, width: number, height: number): number {
//   const base = Math.min(width, height)
  
//   switch(name) {
//     case 'mollweide':
//       return base / 4
//     case 'robinson':
//       return base / 3.8
//     case 'natural_earth':
//       return base / 3.5
//     case 'plate_carree':
//       return base / 3.5
//     case 'sinusoidal':
//       return base / 3.5
//     case 'eckert4':
//       return base / 3.8
//     case 'winkel-tripel':
//       return base / 3.6

//     case 'miller':
//       return base /  3.8
//     case 'mercator':
//       return base / 4

//     default:
//       return base / 2.2
//   }
// }



/**
 * Projection utilities for geographic visualizations
 */

export interface Point2D {
  x: number
  y: number

}


/**
 * Mollweide projection
 */
export function projectMollweide(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  
  let theta = phi
  for (let i = 0; i < 10; i++) {
    const dtheta = -(theta + Math.sin(theta) - Math.PI * Math.sin(phi)) / (1 + Math.cos(theta))
    theta += dtheta
    if (Math.abs(dtheta) < 1e-6) break
  }
  
  const x = (2 * Math.sqrt(2) / Math.PI) * lambda * Math.cos(theta / 2)
  const y = Math.sqrt(2) * Math.sin(theta / 2)
  
  return {x, y}
}

/**
 * Natural Earth projection
 */
export function projectNaturalEarth(lon: number, lat: number): Point2D {
  const lplam = lon * Math.PI / 180
  const lpphi = lat * Math.PI / 180
  
  const A0 = 0.8707
  const A1 = -0.131979
  const A2 = -0.013791
  const A3 = 0.003971
  const A4 = -0.001529
  const B0 = 1.007226
  const B1 = 0.015085
  const B2 = -0.044475
  const B3 = 0.028874
  const B4 = -0.005916
  
  const phi2 = lpphi * lpphi
  const phi4 = phi2 * phi2
  
  const x = lplam * (A0 + phi2 * (A1 + phi2 * (A2 + phi4 * phi2 * (A3 + phi2 * A4))))
  const y = lpphi * (B0 + phi2 * (B1 + phi4 * (B2 + B3 * phi2 + B4 * phi4)))
  
  return {x, y}
}

/**
 * Robinson projection
 */
export function projectRobinson(lon: number, lat: number): Point2D {
  // Robinson projection lookup tables
  const ROBINSON_AA = [
    1.0000, 0.9986, 0.9954, 0.9900, 0.9822, 0.9730, 0.9600, 0.9427,
    0.9216, 0.8962, 0.8679, 0.8350, 0.7986, 0.7597, 0.7186, 0.6732,
    0.6213, 0.5722, 0.5322
  ]
  
  const ROBINSON_BB = [
    0.0000, 0.0620, 0.1240, 0.1860, 0.2480, 0.3100, 0.3720, 0.4340,
    0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936,
    0.9394, 0.9761, 1.0000
  ]
  
  const lplam = lon * Math.PI / 180
  let lpphi = lat * Math.PI / 180
  
  const sign = lpphi < 0 ? -1 : 1
  lpphi = Math.abs(lpphi)
  
  const phi_deg = lpphi * 180 / Math.PI
  const i = Math.floor(phi_deg / 5)
  const i_clamped = Math.min(i, 17)
  
  const dphi = (phi_deg - i_clamped * 5) / 5
  
  const aa = ROBINSON_AA[i_clamped] + (ROBINSON_AA[i_clamped + 1] - ROBINSON_AA[i_clamped]) * dphi
  const bb = ROBINSON_BB[i_clamped] + (ROBINSON_BB[i_clamped + 1] - ROBINSON_BB[i_clamped]) * dphi
  
  const x = 0.8487 * aa * lplam
  const y = 1.3523 * bb * sign
  
  return {x, y}
}

/**
 * Plate Carrée (Equirectangular) projection
 */
export function projectPlateCarree(lon: number, lat: number): Point2D {
  const x = lon * Math.PI / 180
  const y = lat * Math.PI / 180
  return {x, y}
}



/**
 * Sinusoidal projection (Sanson-Flamsteed)
 * Equal-area pseudocylindrical
 */
export function projectSinusoidal(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  
  const x = lambda * Math.cos(phi)
  const y = phi
  
  return { x, y }
}

/**
 * Eckert IV projection
 * Equal-area pseudocylindrical
 */
export function projectEckertIV(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  
  const C = 2 + Math.PI / 2
  let theta = phi / 2
  
  // Newton-Raphson iteration
  for (let i = 0; i < 10; i++) {
    const delta = -(theta + Math.sin(theta) * Math.cos(theta) + 2 * Math.sin(theta) - C * Math.sin(phi)) /
                   (2 * Math.cos(theta) * (1 + Math.cos(theta)))
    theta += delta
    if (Math.abs(delta) < 1e-7) break
  }
  
  const x = 2 / Math.sqrt(Math.PI * (4 + Math.PI)) * lambda * (1 + Math.cos(theta))
  const y = 2 * Math.sqrt(Math.PI / (4 + Math.PI)) * Math.sin(theta)
  
  return { x, y }
}


/**
 * Winkel Tripel projection
 * Compromise projection used by National Geographic
 */
export function projectWinkelTripel(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  const phi1 = 50.467 * Math.PI / 180 // Standard parallel
  
  // Aitoff portion
  const alpha = Math.acos(Math.cos(phi) * Math.cos(lambda / 2))
  const sinc_alpha = alpha === 0 ? 1 : Math.sin(alpha) / alpha
  
  const x_aitoff = 2 * Math.cos(phi) * Math.sin(lambda / 2) / sinc_alpha
  const y_aitoff = Math.sin(phi) / sinc_alpha
  
  // Equirectangular portion
  const x_eqr = lambda * Math.cos(phi1)
  const y_eqr = phi
  
  // Average
  const x = (x_aitoff + x_eqr) / 2
  const y = (y_aitoff + y_eqr) / 2
  
  return { x, y }
}


/**
 * Miller Cylindrical projection
 * Compromise cylindrical projection
 */
export function projectMiller(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  
  const x = lambda
  const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))
  
  return { x, y }
}
/**
 * Mercator projection
 * Conformal cylindrical projection
 */
export function projectMercator(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi = lat * Math.PI / 180
  
  // Clamp latitude to avoid infinity
  const clampedPhi = Math.max(-85 * Math.PI / 180, Math.min(85 * Math.PI / 180, phi))
  
  const x = lambda
  const y = Math.log(Math.tan(Math.PI / 4 + clampedPhi / 2))
  
  return { x, y }
}




export function projectAlbersEqualArea(lon: number, lat: number): Point2D {
  const lambda = lon * Math.PI / 180
  const phi   = lat * Math.PI / 180

  // Standard parallels & origin (classic US parameters)
  const phi1   = 29.5 * Math.PI / 180
  const phi2   = 45.5 * Math.PI / 180
  const phi0   = 23.0 * Math.PI / 180
  const lambda0 = -96.0 * Math.PI / 180

  const sinPhi1 = Math.sin(phi1)
  const sinPhi2 = Math.sin(phi2)

  const n  = 0.5 * (sinPhi1 + sinPhi2)
  const C  = Math.cos(phi1) * Math.cos(phi1) + 2 * n * sinPhi1
  const rho0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n

  // Guard: if the argument to sqrt goes negative (very high latitude with
  // these parameters) clamp it to zero so we get the pole arc.
  const arg = C - 2 * n * Math.sin(phi)
  const rho = Math.sqrt(Math.max(0, arg)) / n

  const theta = n * (lambda - lambda0)

  const x = rho * Math.sin(theta)
  const y = rho0 - rho * Math.cos(theta)

  return { x, y }
}


/**
 * Get projection function by name
 */
export function getProjection(name: string): (lon: number, lat: number) => Point2D {
  switch(name) {
    case 'mollweide':
      return projectMollweide
    case 'natural_earth':
      return projectNaturalEarth
    case 'robinson':
      return projectRobinson
    case 'plate_carree':
      return projectPlateCarree
    case 'sinusoidal':
      return projectSinusoidal
    case 'eckert4':
      return projectEckertIV
    case 'winkel_tripel':
      return projectWinkelTripel
    case 'miller':
      return projectMiller
    case 'mercator':
      return projectMercator

    case 'albers_equal_area':
      return projectAlbersEqualArea

    default:
      return projectNaturalEarth
  }
}


/**
 * Get scale factor for projection
 */
export function getProjectionScale(name: string, width: number, height: number): number {
  const base = Math.min(width, height)
  
  switch(name) {
    case 'mollweide':
      return base / 4
    case 'robinson':
      return base / 3.8
    case 'natural_earth':
      return base / 3.5
    case 'plate_carree':
      return base / 3.5
    case 'sinusoidal':
      return base / 3.5
    case 'eckert4':
      return base / 3.8
    case 'winkel_tripel':
      return base / 3.6
    case 'miller':
      return base / 3.8
    case 'mercator':
      return base / 4

    case 'albers_equal_area':
      return base / 4.2

    default:
      return base / 2.2
  }
}
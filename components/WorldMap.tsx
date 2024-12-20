'use client'

import React from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  ZoomableGroup,
  Sphere,
  Graticule 
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const geoUrl = '/world-110m.json'

interface WorldMapProps {
  data: Record<string, number>
}

export default function WorldMap({ data }: WorldMapProps) {
  // Normalize location data (assuming format like "Country, City")
  const countryData = Object.entries(data).reduce((acc, [location, count]) => {
    const country = location.split(',')[0].trim();
    acc[country] = (acc[country] || 0) + count;
    return acc;
  }, {} as Record<string, number>);

  // Create color scale based on click counts
  const colorScale = scaleQuantile<string>()
    .domain(Object.values(countryData))
    .range([
      '#f7fbff', 
      '#deebf7', 
      '#c6dbef', 
      '#9ecae1', 
      '#6baed6', 
      '#4292c6', 
      '#2171b5', 
      '#08519c', 
      '#08306b'
    ]);

  return (
    <div className="w-full h-[500px]">
      <ComposableMap 
        projectionConfig={{ 
          scale: 147,
          center: [0, 20] 
        }}
      >
        <ZoomableGroup zoom={1}>
          <Sphere stroke="#E4E5E6" strokeWidth={0.5} fill="transparent" />
          <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
          <Geographies geography={geoUrl}>
            {({ geographies }) => 
              geographies.map(geo => {
                const countryName = geo.properties.name;
                const clickCount = countryData[countryName] || 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={clickCount > 0 
                      ? colorScale(clickCount) 
                      : '#E4E5E6'
                    }
                    stroke="#D6D6DA"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { 
                        fill: clickCount > 0 
                          ? colorScale(clickCount * 1.2) 
                          : '#E4E5E6',
                        outline: 'none' 
                      },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={() => {
                      // Optional: Add tooltip logic
                    }}
                    onMouseLeave={() => {
                      // Optional: Remove tooltip logic
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

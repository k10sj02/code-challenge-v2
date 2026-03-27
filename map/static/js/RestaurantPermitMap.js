import React, { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })

  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(Number(e.target.value))}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)
  const currentYearDataRef = useRef({ data: [], maxNumPermits: 0 })

  console.log("Selected year:", year)

  useEffect(() => {
    fetch(`/map-data/?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        const maxNumPermits = data.reduce(
          (max, area) => Math.max(max, area.num_permits),
          0
        )
        currentYearDataRef.current = { data, maxNumPermits }
        setCurrentYearData(data)
      })
  }, [year])

  const totalPermits = currentYearData.reduce(
    (sum, area) => sum + area.num_permits,
    0
  )

  const maxNumPermits = currentYearData.reduce(
    (max, area) => Math.max(max, area.num_permits),
    0
  )

  function getColor(p) {
    if (p > 0.75) return communityAreaColors[3]
    if (p > 0.5) return communityAreaColors[2]
    if (p > 0.25) return communityAreaColors[1]
    return communityAreaColors[0]
  }

  function setAreaInteraction(feature, layer) {
    const areaName = feature.properties.community.toUpperCase()

    const { data, maxNumPermits } = currentYearDataRef.current

    const areaData = data.find((area) => area.name === areaName)
    const numPermits = areaData ? areaData.num_permits : 0
    const percentage = maxNumPermits > 0 ? numPermits / maxNumPermits : 0

    layer.setStyle({
      fillColor: getColor(percentage),
      fillOpacity: 0.7,
      weight: 1,
      color: "#333",
    })

    layer.on("mouseover", () => {
      layer.bindPopup(`<strong>${areaName}</strong><br/>Permits: ${numPermits}`)
      layer.openPopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />

      <p className="fs-4">
        Restaurant permits issued this year: {totalPermits}
      </p>

      <p className="fs-4">
        Maximum number of restaurant permits in a single area: {maxNumPermits}
      </p>

      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />

        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={year}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
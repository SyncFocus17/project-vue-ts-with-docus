// Weather Service with mock data and simulated API calls

export interface Weather {
    temperature: number
    feelsLike: number
    windSpeed: number
    windDirection: string
    windGusts: number
    waveHeight: number
    humidity: number
    visibility: number
    condition: string
    timestamp: string
}

export interface Location {
    id: number
    name: string
    image: string
    coordinates: {
        lat: number
        lon: number
    }
    weather: Weather
}

class WeatherService {
    private static instance: WeatherService

    private locations: Location[] = [
        {
            id: 1,
            name: 'Zandvoort',
            image: '/images/locations/zandvoort.jpg',
            coordinates: { lat: 52.3714, lon: 4.5270 },
            weather: this.generateWeatherData()
        },
        {
            id: 2,
            name: 'Scheveningen',
            image: '/images/locations/scheveningen.jpg',
            coordinates: { lat: 52.1031, lon: 4.2734 },
            weather: this.generateWeatherData()
        },
        {
            id: 3,
            name: 'IJmuiden',
            image: '/images/locations/ijmuiden.jpg',
            coordinates: { lat: 52.4580, lon: 4.5508 },
            weather: this.generateWeatherData()
        }
    ]

    private constructor() {
        this.updateAllWeather()
    }

    public static getInstance(): WeatherService {
        if (!WeatherService.instance) {
            WeatherService.instance = new WeatherService()
        }
        return WeatherService.instance
    }

    private generateWeatherData(): Weather {
        const conditions = ['sunny', 'cloudy', 'rainy', 'stormy']
        const directions = ['N', 'NO', 'O', 'ZO', 'Z', 'ZW', 'W', 'NW']

        return {
            temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
            feelsLike: Math.floor(Math.random() * 15) + 14, // 14-29°C
            windSpeed: Math.floor(Math.random() * 8) + 2, // 2-10 Bft
            windDirection: directions[Math.floor(Math.random() * directions.length)],
            windGusts: Math.floor(Math.random() * 10) + 3, // 3-13 Bft
            waveHeight: Math.round((Math.random() * 2 + 0.5) * 10) / 10, // 0.5-2.5m
            humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
            visibility: Math.floor(Math.random() * 8) + 5, // 5-13km
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            timestamp: new Date().toISOString()
        }
    }

    private updateAllWeather(): void {
        this.locations = this.locations.map(location => ({
            ...location,
            weather: this.generateWeatherData()
        }))
    }

    public async getLocationsWeather(): Promise<Location[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return [...this.locations]
    }

    public async refreshWeather(): Promise<Location[]> {
        this.updateAllWeather()
        return this.getLocationsWeather()
    }
}

export default WeatherService.getInstance()
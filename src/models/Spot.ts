export interface Spot {
    id: string;
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: string; // ISO string
    note?: string;
    photoPath?: string;
    altitudeHint?: number;
    vehicleId?: string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSpaces(date?: string, startTime?: string, endTime?: string) {
    let url = `${this.apiUrl}/spaces`;
    
    if (date && startTime && endTime) {
      const params = new URLSearchParams({
        date: date,
        start_time: startTime,
        end_time: endTime
      });
      url += `?${params.toString()}`;
    }
    
    return this.http.get<any[]>(url);
  }

  getAllReservationsByUser(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/user/${userId}`);
  }

  getAllReservationsBySpace(spaceId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/space/${spaceId}`);
  }

  getReservation(reservationId: number) {
    return this.http.get<any>(`${this.apiUrl}/reservations/${reservationId}`);
  }

  createReservation(payload: any) {
    return this.http.post(`${this.apiUrl}/reservations`, payload);
  }

  updateReservation(reservationId: number, payload: any) {
    return this.http.put(`${this.apiUrl}/reservations/${reservationId}`, payload);
  }

  deleteReservation(reservationId: number) {
    return this.http.delete(`${this.apiUrl}/reservations/${reservationId}`);
  }

  getReservationsBySpace(spaceId: number, date?: string) {
    let url = `${this.apiUrl}/reservations/space/${spaceId}`;
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    return this.http.get<any[]>(url);
  }

  createSpace(payload: any) {
    return this.http.post(`${this.apiUrl}/spaces`, payload);
  }

  updateSpace(spaceId: number, payload: any) {
    return this.http.put(`${this.apiUrl}/spaces/${spaceId}`, payload);
  }

  deleteSpace(spaceId: number) {
    return this.http.delete(`${this.apiUrl}/spaces/${spaceId}`);
  }
}

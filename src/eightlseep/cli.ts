import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { EIGHT_SLEEP_APP_API, EIGHT_SLEEP_AUTH_API, EIGHT_SLEEP_CLIENT_API } from "../constants";
import {
  CreateAlarmRequest,
  CreateAlarmResponse,
  GetMeUserResponse,
  ListAlarmsResponse,
  ListSchedulesResponse,
  OAuth2RequestTokenResponse,
  Schedule,
  SetUserBedtimeRequest,
} from "./types";
import { DateTime } from "luxon";

interface Session {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  userId: string;
}

export default class EightSleepClient {
  protected session: Session | null = null;
  private clientAPI: AxiosInstance;
  private appAPI: AxiosInstance;

  constructor(
    private clientID: string,
    private clientSecret: string,
    private username: string,
    private password: string,
  ) {
    const axiosConfig = {
      timeout: 5_000, // 5 seconds in ms
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    this.clientAPI = axios.create({
      ...axiosConfig,
      baseURL: EIGHT_SLEEP_CLIENT_API,
    });

    this.appAPI = axios.create({
      ...axiosConfig,
      baseURL: EIGHT_SLEEP_APP_API,
    });

    const okInterceptor = async (config: InternalAxiosRequestConfig<any>) => {
      console.log(`[8sleep] ${config.method} ${config.url}`, JSON.stringify(config.data ?? null));

      const session = await this.getSession();
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
      return config;
    };

    this.clientAPI.interceptors.request.use(okInterceptor, (error) => Promise.reject(error));
    this.appAPI.interceptors.request.use(okInterceptor, (error) => Promise.reject(error));
  }

  public async getSession(): Promise<Session> {
    if (this.session && this.session.accessTokenExpiresAt > new Date()) return this.session;

    const res = await this.requestToken();

    this.session = {
      accessToken: res.access_token,
      accessTokenExpiresAt: DateTime.now().plus({ seconds: res.expires_in }).toJSDate(),
      refreshToken: res.refresh_token,
      userId: res.userId,
    };

    return this.session;
  }

  private async requestToken(): Promise<OAuth2RequestTokenResponse> {
    const response = await axios.post<OAuth2RequestTokenResponse>(
      "/v1/tokens",
      {
        client_id: this.clientID,
        client_secret: this.clientSecret,
        grant_type: "password",
        username: this.username,
        password: this.password,
      },
      {
        baseURL: EIGHT_SLEEP_AUTH_API,
      },
    );

    return response.data;
  }

  /**
   * Retrieves the currently authenticated user
   */
  public async getMeUser(): Promise<GetMeUserResponse> {
    const rsp = await this.clientAPI.get(`/v1/users/me`);
    return rsp.data;
  }

  /**
   * Retrieves the currently authenticated user
   */
  public async listSchedules(): Promise<Schedule[]> {
    const rsp = await this.appAPI.get<ListSchedulesResponse>(`/v1/users/${this.session!.userId}/temperature/all`);
    return rsp.data.schedules;
  }

  /**
   * Retrieves the currently authenticated user
   */
  public async setUserBedtime(payload: SetUserBedtimeRequest): Promise<void> {
    const rsp = await this.appAPI.put(`v1/users/${this.session!.userId}/bedtime`, payload);
    return rsp.data;
  }

  /**
   * List the user alarms
   */
  public async listAlarms(): Promise<ListAlarmsResponse> {
    const rsp = await this.appAPI.get(`/v1/users/${this.session!.userId}/alarms`);
    return rsp.data;
  }

  /**
   * Deletes an alarm
   * @param alarmID
   */
  public async deleteAlarm(alarmID: string): Promise<void> {
    const rsp = await this.appAPI.delete<void>(`/v1/users/${this.session!.userId}/alarms/${alarmID}`);
    return rsp.data;
  }

  /**
   * Create a new Alarm
   */
  public async createAlarm(data: CreateAlarmRequest): Promise<CreateAlarmResponse> {
    const rsp = await this.appAPI.post(`/v1/users/${this.session!.userId}/alarms`, data);
    return rsp.data;
  }
}

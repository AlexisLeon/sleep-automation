import axios, { AxiosInstance } from "axios";
import { WHOOP_API } from "../constants";
import {
  OAuth2RequestTokenResponse,
  RetrieveSmartAlarmPreferencesResponse,
  RetrieveSleepNeededResponse,
} from "./types";
import { DateTime } from "luxon";

interface Session {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export default class WhoopClient {
  protected session: Session | null = null;
  private axiosCli: AxiosInstance;

  constructor(
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

    this.axiosCli = axios.create({
      ...axiosConfig,
      baseURL: WHOOP_API,
    });

    this.axiosCli.interceptors.request.use(
      async (config) => {
        console.log(`[whoop] ${config.method} ${config.url}`, JSON.stringify(config.data ?? null));

        const session = await this.getSession();
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  public async getSession(): Promise<Session> {
    if (this.session && this.session.accessTokenExpiresAt > new Date()) return this.session;

    const res = await this.requestToken();

    this.session = {
      accessToken: res.access_token,
      accessTokenExpiresAt: DateTime.now()
        .plus({
          milliseconds: res.access_token_expires_in,
        })
        .toJSDate(),
      refreshToken: res.refresh_token,
      refreshTokenExpiresAt: DateTime.now()
        .plus({
          milliseconds: res.refresh_token_expires_in,
        })
        .toJSDate(),
    };

    return this.session;
  }

  private async requestToken(): Promise<OAuth2RequestTokenResponse> {
    const response = await axios.post<OAuth2RequestTokenResponse>(
      "/auth-service/v2/whoop/sign-in",
      {
        username: this.username,
        password: this.password,
      },
      {
        baseURL: WHOOP_API,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  }

  /**
   * Retrieves the sleep needed from the sleep coach service
   */
  public async retrieveSleepNeeded(): Promise<RetrieveSleepNeededResponse> {
    const rsp = await this.axiosCli.get(`/coaching-service/v2/sleepneed`);
    return rsp.data;
  }

  /**
   * Retrieves the smart alarm preferences
   */
  public async retrieveSmartAlarmPreferences(): Promise<RetrieveSmartAlarmPreferencesResponse> {
    const rsp = await this.axiosCli.get(`/smart-alarm-service/v1/smartalarm/preferences`);
    return rsp.data;
  }
}

export class Environment {

    public static readonly token = Environment.handleValue(process.env.token);
    public static readonly pub = Environment.handleValue(process.env.pub);
    public static readonly clientId = Environment.handleValue(process.env.clientId);
    public static readonly serverId = Environment.handleValue(process.env.serverId);
    public static readonly API_URL = Environment.handleValue(process.env.API_URL);
    public static readonly API_ACCESS_TOKEN = Environment.handleValue(process.env.API_ACCESS_TOKEN);
    public static readonly API_TOKEN_HEADER = Environment.handleValue(process.env.API_TOKEN_HEADER);
    public static readonly LOG_CHANNEL = Environment.handleValue(process.env.LOG_CHANNEL);

    private static handleValue(value: string | undefined) {
        return value != null ? value : "";
    }

}
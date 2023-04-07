export interface VictronInfluxDataPoint {
  timestamp: Date;
  measurement: string;
  tags: {
    portalId: string;
    instanceNumber: string;
    name: string;
  };
  fields: { [key: string]: string | number };
}

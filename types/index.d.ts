declare module '@openzeppelin/defender-sdk' {
  export * from '@openzeppelin/defender-sdk-base-client';
  export * from '@openzeppelin/defender-sdk-deploy-client';
  export * from '@openzeppelin/defender-sdk-relay-client';
  export * from '@openzeppelin/defender-sdk-monitor-client';
}

declare module '*.json' {
  const value: any;
  export default value;
}

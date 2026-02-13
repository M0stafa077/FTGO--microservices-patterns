export enum DeadLetterHeader {
  ErrorCode = 'errorCode',
  ErrorMessage = 'errorMessage',
  Attempts = 'attempts',
  SourceTopic = 'sourceTopic',
  SourcePartition = 'sourcePartition',
  SourceOffset = 'sourceOffset',
}

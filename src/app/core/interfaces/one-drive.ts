export interface GetAllFolder {
  '@odata.context': string;
  name_file?: string;
  value: Value[];
}

export interface Value {
  createdDateTime: string;
  eTag: string;
  id: string;
  lastModifiedDateTime: string;
  name: string;
  webUrl: string;
  cTag: string;
  size: number;
  createdBy: CreatedBy;
  lastModifiedBy: CreatedBy;
  parentReference: ParentReference;
  fileSystemInfo: FileSystemInfo;
  folder: Folder;
}

export interface Folder {
  childCount: number;
}

export interface FileSystemInfo {
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export interface ParentReference {
  driveType: string;
  driveId: string;
  id: string;
  path: string;
}

export interface CreatedBy {
  application: Application;
  user: User;
}

export interface User {
  email: string;
  id: string;
  displayName: string;
}

export interface Application {
  id: string;
  displayName: string;
}

export interface UploadFile {
  '@odata.context': string;
  '@microsoft.graph.downloadUrl': string;
  createdDateTime: string;
  eTag: string;
  id: string;
  lastModifiedDateTime: string;
  name: string;
  webUrl: string;
  cTag: string;
  size: number;
  createdBy: CreatedBy;
  lastModifiedBy: CreatedBy;
  parentReference: ParentReference;
  file: File;
  fileSystemInfo: FileSystemInfo;
}

export interface File {
  mimeType: string;
  hashes: Hashes;
}

export interface Hashes {
  quickXorHash: string;
}

export interface SesionUpload {
  '@odata.context': string;
  expirationDateTime: string;
  nextExpectedRanges: string[];
  uploadUrl: string;
}

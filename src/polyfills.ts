import { Blob } from 'blob-polyfill';

File.prototype.text = Blob.prototype.text;
File.prototype.stream = Blob.prototype.stream;
File.prototype.arrayBuffer = Blob.prototype.arrayBuffer;

import { connect } from 'mongoose';

export class MongooseService {
  async connect(url: string) {
    await connect(url);
  }
}

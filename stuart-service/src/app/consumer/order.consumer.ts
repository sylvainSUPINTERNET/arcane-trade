import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('order')
export class OrderConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log("New job to consume: ", job.data)
    
    // let progress = 0;
    // for (i = 0; i < 100; i++) {
    //   await doSomething(job.data);
    //   progress += 1;
    //   await job.progress(progress);
    // }
    return {};
  }
}
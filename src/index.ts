/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.json`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
	async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
		// MessageBatch has a `queue` property we can switch on
		// batch.queue is equal to the queue name that the messages were sent to. 

		const { queue, messages } = batch;
		//console.log(`Received a batch of ${messages.length} messages for queue ${queue}`);
		//console.log(`The first message is: ${(JSON.stringify(messages[0].body, null, 2))}`);

		// Switch on the queue name and handle the messages accordingly
		switch (batch.queue) {
			// Handle messages sent to the 'tracktor' queue
		  case 'QUEUE_NAME': {
			const msgs = await env.WORKFLOW_BINDING.create({
                params: messages,
            });

			if(msgs.id){
				// If messages are received by the external service, acknowledge them. 
				batch.ackAll();
				console.log(`Sent ${messages.length} messages to ${batch.queue}): ${JSON.stringify(msgs.id, null, 2)}`);
			} else {

				// If the external service is down or unreachable, retry the messages after a delay
				batch.retryAll({ delaySeconds: 360 });
				console.log(`Failed to send ${messages.length} messages to to ${batch.queue}). Retrying in 6 minutes`);
			}
			
			break;
		  }
		  
		  default:
		  // Handle messages we haven't mentioned explicitly (write a log, push to a DLQ)
		}
	  },
};

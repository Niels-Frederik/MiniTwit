
class Monitoring {
  constructor(prom, register) {
	register.setDefaultLabels({
	  app: 'minitwit'
	})
	console.log('printing' + register)
	prom.collectDefaultMetrics({ register })

	this.request_counter = new prom.Counter({
	  name: 'minitwit_total_requests',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.request_counter)

	this.information_response_counter = new prom.Counter({
	  name: 'minitwit_information_response_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.information_response_counter)

	this.success_response_counter = new prom.Counter({
	  name: 'minitwit_successful_response_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.success_response_counter)

	this.redirect_response_counter = new prom.Counter({
	  name: 'minitwit_redirect_response_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.redirect_response_counter)

	this.client_error_response_counter = new prom.Counter({
	  name: 'minitwit_client_error_response_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.client_error_response_counter)

	this.server_error_response_counter = new prom.Counter({
	  name: 'minitwit_server_error_response_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.server_error_response_counter)


	this.follow_request_counter = new prom.Counter({
	  name: 'minitwit_follow_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.follow_request_counter)

	this.follow_success_counter = new prom.Counter({
	  name: 'minitwit_follow_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.follow_success_counter)

	this.follow_failure_counter = new prom.Counter({
	  name: 'minitwit_follow_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.follow_failure_counter)


	this.unfollow_request_counter = new prom.Counter({
	  name: 'minitwit_unfollow_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.unfollow_request_counter)

	this.unfollow_success_counter = new prom.Counter({
	  name: 'minitwit_unfollow_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.unfollow_success_counter)

	this.unfollow_failure_counter = new prom.Counter({
	  name: 'minitwit_unfollow_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.unfollow_failure_counter)


	this.getFollows_request_counter = new prom.Counter({
	  name: 'minitwit_getFollows_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getFollows_request_counter)

	this.getFollows_success_counter = new prom.Counter({
	  name: 'minitwit_getFollows_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getFollows_success_counter)

	this.getFollows_failure_counter = new prom.Counter({
	  name: 'minitwit_getFollows_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getFollows_failure_counter)


	this.register_request_counter = new prom.Counter({
	  name: 'minitwit_register_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.register_request_counter)

	this.register_success_counter = new prom.Counter({
	  name: 'minitwit_register_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.register_success_counter)

	this.register_failure_counter = new prom.Counter({
	  name: 'minitwit_register_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.register_failure_counter)


	this.getMessages_request_counter = new prom.Counter({
	  name: 'minitwit_getMessages_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_request_counter)

	this.getMessages_success_counter = new prom.Counter({
	  name: 'minitwit_getMessages_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_success_counter)

	this.getMessages_failure_counter = new prom.Counter({
	  name: 'minitwit_getMessages_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_failure_counter)
	

	this.getMessages_username_request_counter = new prom.Counter({
	  name: 'minitwit_getMessages_username_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_username_request_counter)

	this.getMessages_username_success_counter = new prom.Counter({
	  name: 'minitwit_getMessages_username_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_username_success_counter)
	
	this.getMessages_username_failure_counter = new prom.Counter({
	  name: 'minitwit_getMessages_username_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.getMessages_username_failure_counter)


	this.messages_request_counter = new prom.Counter({
	  name: 'minitwit_messages_request_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.messages_request_counter)
	
	this.messages_success_counter = new prom.Counter({
	  name: 'minitwit_messages_success_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.messages_success_counter)

	this.messages_failure_counter = new prom.Counter({
	  name: 'minitwit_messages_failure_counter',
	  help: 'metric_help',
	  registers: [register],
	});
	register.registerMetric(this.messages_failure_counter)
  }
}

module.exports.Monitoring = Monitoring

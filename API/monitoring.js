
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
  }
}

module.exports.Monitoring = Monitoring

module.exports = {
  apps : [{
    name   : "zhangshuwan-november-fileserver",
    script : "app.js",
    watch  : true,
    env_production : {
      PORT : 4000
    }
  }]
}
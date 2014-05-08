module.exports =
  securitySalt: "&*5/5+hd-5qkjzn;?66@-{]=}"
  db_uri: "mongodb://oceanic.mongohq.com:10060/local-dev"
  db_opt:
    user: "server"
    pass: "2f61cb7837b83df50a7fffb58e802b87679cdaff"

  port: process.env.OPENSHIFT_NODEJS_PORT or process.env.PORT or 1234
  ip: process.env.OPENSHIFT_NODEJS_IP or process.env.IP or ""
  theme: "flatly"
  env: "dev"
  user_groups:
    admin:
      full_name: "Administrators"
      description: "Adminsitators."
      allowedActions: "all"

    modo:
      full_name: "Moderators"
      description: "Moderators."
      allowedActions: [
        "mod:*"
        "comment:*"
        "user:delete browse add banish edit"
      ]

    user:
      full_name: "User"
      description: "User."
      allowedActions: [
        "mod:browse add star"
        "comment:browse add"
        "user:browse"
      ]

    guest:
      full_name: "Guest"
      description: "Guest."
      allowedActions: [
        "mod:browse"
        "comment:browse"
        "user:browse add"
      ]

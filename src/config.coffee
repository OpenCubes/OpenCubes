module.exports =
  securitySalt: "thisisnotaverygoodsalt"
  db_uri: ""
  db_opt:

    # database username
    user: "username"

    # db password
    pass: "password"


  # target port
  port: process.env.PORT or 5000

  # target ip (optionnal)
  ip: process.env.IP or ""

  # theme - deprecated
  theme: "flatly"

  # env
  env: "dev"

  # user group and perms
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
        "comments:*"
        "user:delete browse add banish edit"
      ]

    user:
      full_name: "User"
      description: "User."
      allowedActions: [
        "mod:browse"
        "comments:browse add"
        "user:browse"
      ]

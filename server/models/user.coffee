###
Module dependencies.
###
mongoose = require("mongoose")
Schema = mongoose.Schema
crypto = require("crypto")
oAuthTypes = [
  "github"
  "twitter"
  "facebook"
  "google"
  "linkedin"
]

###
User Schema
###
UserSchema = new Schema(
  email:
    type: String
    default: ""

  username:
    type: String
    default: ""

  provider:
    type: String
    default: ""

  hashed_password:
    type: String
    default: ""

  salt:
    type: String
    default: ""

  authToken:
    type: String
    default: ""

  facebook: {}
  twitter: {}
  github: {}
  google: {}
  linkedin: {}
)

###
Virtuals
###
UserSchema.virtual("password").set((password) ->
  @_password = password
  @salt = @makeSalt()
  @hashed_password = @encryptPassword(password)
  return
).get ->
  @_password


###
Validations
###
validatePresenceOf = (value) ->
  value and value.length


# the below 5 validations only apply if you are signing up traditionally
UserSchema.path("email").validate ((email) ->
  return true  if @doesNotRequireValidation()
  email.length
), "Email cannot be blank"
UserSchema.path("email").validate ((email, fn) ->
  User = mongoose.model("User")
  fn true  if @doesNotRequireValidation()
  
  # Check only when it is a new user or when email field is modified
  if @isNew or @isModified("email")
    User.find(email: email).exec (err, users) ->
      fn not err and users.length is 0
      return

  else
    fn true
  return
), "Email already exists"
UserSchema.path("username").validate ((username) ->
  return true  if @doesNotRequireValidation()
  username.length
), "Username cannot be blank"
UserSchema.path("hashed_password").validate ((hashed_password) ->
  return true  if @doesNotRequireValidation()
  hashed_password.length
), "Password cannot be blank"

###
Pre-save hook
###
UserSchema.pre "save", (next) ->
  return next()  unless @isNew
  if not validatePresenceOf(@password) and not @doesNotRequireValidation()
    next new Error("Invalid password")
  else
    next()
  return


###
Methods
###
UserSchema.methods =
  
  ###
  Authenticate - check if the passwords are the same
  
  @param {String} plainText
  @return {Boolean}
  @api public
  ###
  authenticate: (plainText) ->
    @encryptPassword(plainText) is @hashed_password

  
  ###
  Make salt
  
  @return {String}
  @api public
  ###
  makeSalt: ->
    Math.round((new Date().valueOf() * Math.random())) + ""

  
  ###
  Encrypt password
  
  @param {String} password
  @return {String}
  @api public
  ###
  encryptPassword: (password) ->
    return ""  unless password
    encrypred = undefined
    try
      encrypred = crypto.createHash("sha256", @salt).update(password).digest("hex")
      return encrypred
    catch err
      return ""
    return

  
  ###
  Validation is not required if using OAuth
  ###
  doesNotRequireValidation: ->
    ~oAuthTypes.indexOf(@provider)

mongoose.model "User", UserSchema

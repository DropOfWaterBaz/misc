
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (UserDWRFacade == null) var UserDWRFacade = {};
UserDWRFacade._path = '/webapps/bb-social-learning-BB5cf4ce7a4424f/dwr_open';
UserDWRFacade.isUserFoundInContext = function(callback) {
  dwr.engine._execute(UserDWRFacade._path, 'UserDWRFacade', 'isUserFoundInContext', callback);
}
UserDWRFacade.initContextFromRequestHeader = function(callback) {
  dwr.engine._execute(UserDWRFacade._path, 'UserDWRFacade', 'initContextFromRequestHeader', false, callback);
}

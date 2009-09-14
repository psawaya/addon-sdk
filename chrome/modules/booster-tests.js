(function(global) {
   const Cc = Components.classes;
   const Ci = Components.interfaces;
   const Cu = Components.utils;

   var exports = new Object();

   exports.run = function run(SecurableModule, log) {
     var output = [];
     function print(message) {
       output.push(message);
     }

     function assertEqual(a, b) {
       var op = "!=";
       var label = "fail";
       if (a == b) {
         op = "==";
         label = "pass";
       }
       var message = uneval(a) + op + uneval(b);
       log(message, label);
     }

     var loader = new SecurableModule.Loader(
       {fs: {
          resolveModule: function(root, path) {
            return path;
          },
          getFile: function(path) {
            return {contents: ('print("hi from ' + path + '");' +
                               ' exports.beets = 5;')};
          }
        },
        globals: {print: print}
       });
     loader.runScript({contents: 'print("beets is " + ' +
                       'require("beets").beets);'});
     assertEqual(output[0], 'hi from beets');
     assertEqual(output[1], 'beets is 5');
   };

   if (global.window) {
     // We're being loaded in a chrome window, or a web page with
     // UniversalXPConnect privileges.
     global.SecurableModuleTests = exports;
   } else if (global.exports) {
     // We're being loaded in a SecurableModule.
     for (name in exports) {
       global.exports[name] = exports[name];
     }
   } else {
     // We're being loaded in a JS module.
     global.EXPORTED_SYMBOLS = [];
     for (name in exports) {
       global.EXPORTED_SYMBOLS.push(name);
       global[name] = exports[name];
     }
   }
 })(this);
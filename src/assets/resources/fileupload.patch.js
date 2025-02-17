Craft.Uploader = (function(uploader) {
  var toBytes = 1048576;
  var saveActions = [
    'admin/actions/assets/save-asset',
    'admin/actions/assets/upload',
  ];
  var settings = {
    chunkSize: 5,
    maxUploadSize: 500,
  };

  try {
    var scriptTag = document.querySelector("script[data-key='karmabunny/chunked-uploads/fileupload']");
    settings = JSON.parse(scriptTag.getAttribute('data-settings'));
  } catch (error) {
    console.error(error);
  }

  return Craft.Uploader.extend({
    isSaveAction: false,

    init: function($element, settings) {
      uploader.prototype.init.call(this, $element, settings);

      if (
        'url' in settings &&
        saveActions.some(function(saveAction) {
          return settings.url.indexOf(saveAction) !== -1;
        })
      ) {
        this.isSaveAction = true;
      }
    },

    processErrorMessages: function() {
      var str;

      if (this._rejectedFiles.type.length) {
        if (this._rejectedFiles.type.length === 1) {
          str = "The file {files} could not be uploaded. The allowed file kinds are: {kinds}.";
        }
        else {
          str = "The files {files} could not be uploaded. The allowed file kinds are: {kinds}.";
        }

        str = Craft.t('app', str, {files: this._rejectedFiles.type.join(", "), kinds: this.allowedKinds.join(", ")});
        this._rejectedFiles.type = [];
        alert(str);
      }

      if (this._rejectedFiles.size.length) {
        if (this._rejectedFiles.size.length === 1) {
          str = "The file {files} could not be uploaded, because it exceeds the maximum upload size of {size}.";
        }
        else {
          str = "The files {files} could not be uploaded, because they exceeded the maximum upload size of {size}.";
        }

        str = Craft.t('app', str, {files: this._rejectedFiles.size.join(", "), size: this.humanFileSize(this.settings.maxFileSize)});
        this._rejectedFiles.size = [];
        alert(str);
      }

      if (this._rejectedFiles.limit.length) {
        if (this._rejectedFiles.limit.length === 1) {
          str = "The file {files} could not be uploaded, because the field limit has been reached.";
        }
        else {
          str = "The files {files} could not be uploaded, because the field limit has been reached.";
        }

        str = Craft.t('app', str, {files: this._rejectedFiles.limit.join(", ")});
        this._rejectedFiles.limit = [];
        alert(str);
      }
    },

    setParams: function(paramObject) {
      uploader.prototype.setParams.call(this, paramObject);

      if (!this.isSaveAction) {
        this.settings.maxFileSize = uploader.defaults.maxFileSize;
        this.uploader.fileupload('option', 'maxChunkSize', undefined);
      } else {
        this.settings.maxFileSize = settings.maxUploadSize * toBytes;
        this.uploader.fileupload('option', 'maxChunkSize', settings.chunkSize * toBytes);
      }
    },
  }, {
    defaults: Craft.Uploader.defaults
  });
})(Craft.Uploader);

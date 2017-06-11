<md-dialog aria-label="Share Map "  ng-cloak>
  <form name='shareMapForm'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>Share Map</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="parentScope.cancelShare()">
          <md-icon md-svg-icon="close" aria-label="Close Share Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content layout="row" layout-wrap layout-padding layout-margin  layout-align='center center'>
        <h3 flex='100'>Share this map to other publishers</h3>
        <h4 flex='100'>
          <md-input-container>
            <label>Publisher Name</label>
            <input type="text" name='pubName' ng-model='parentScope.shareMapData.pubName' ng-required='true' style='width:400px;' md-autofocus>
          </md-input-container>
        </h4>
        <h4 flex='100'>
          <md-input-container>
            <label>Expiry Date</label>
            <md-datepicker ng-model="parentScope.shareMapData.expiryDate" md-placeholder="Expiry date"></md-datepicker>
          </md-input-container>
        </h4>
    </md-dialog-content>
   <md-dialog-actions>
      <md-button class="md-fab md-accent" ng-click='parentScope.saveShare()' title='Share Map'>
        <md-icon md-svg-icon='save'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="parentScope.cancelShare()">
        <md-icon md-svg-icon="close" aria-label="Cancel Share Map"></md-icon>
      </md-button>
    </md-dialog-actions>
  </form>
</md-dialog>
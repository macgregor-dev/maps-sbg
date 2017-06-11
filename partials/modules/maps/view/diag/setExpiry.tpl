<md-dialog aria-label="Set Expiry "  ng-cloak>
  <form name='setExpiryForm'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>Set Expiry</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="parentScope.cancelSetExpiry()">
          <md-icon md-svg-icon="close" aria-label="Close Set Expiry Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content layout="row" layout-wrap layout-padding layout-margin  layout-align='center center'>
        <h3 flex='100'>Set Expiry Date of this map </h3>
        <h4 flex='100'>Note: If this map has a print-out, make sure to destroy the previous copy before printing a new copy.</h4>
        <h4 flex='100'>
          Expiry Date: 
          <md-datepicker ng-model="parentScope.expiryDate" md-placeholder="Expiry date"></md-datepicker>
        </h4>
    </md-dialog-content>
   <md-dialog-actions>
      <md-button class="md-fab md-accent" ng-click='parentScope.saveExpiry()' title='Set Expiry Date'>
        <md-icon md-svg-icon='save'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="parentScope.cancelSetExpiry()">
        <md-icon md-svg-icon="close" aria-label="Cancel Expiry Date"></md-icon>
      </md-button>
    </md-dialog-actions>
  </form>
</md-dialog>
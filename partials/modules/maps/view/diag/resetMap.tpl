<md-dialog aria-label="Reset Map"  ng-cloak>
  <form name='resetForm'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>Completed Map</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="parentScope.cancelResetMap()">
          <md-icon md-svg-icon="close" aria-label="Close New address Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content layout="row" layout-wrap layout-padding layout-margin  layout-align='center center'>
        <h3 flex='100'>Are you done with this map? If yes, have you saved the map? </h3>
        <h4 flex='100'>Note: All addresses marked 'Drop', 'NE' or 'DNC' will no longer be visible from the map.</h4>
        <h4 flex='100'>
          Completion Date: 
          <md-datepicker ng-model="parentScope.completionDate" md-placeholder="Completion date"></md-datepicker>
        </h4>
    </md-dialog-content>
   <div class="md-actions" layout="row" >
      <md-button class="md-fab md-accent" ng-click='parentScope.completeMap()' title='Complete Map'>
        <md-icon md-svg-icon='save'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="parentScope.cancelResetMap()">
        <md-icon md-svg-icon="close" aria-label="Cancel Map Completion"></md-icon>
      </md-button>
    </div> 
  </form>
</md-dialog>
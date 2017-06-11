<md-dialog aria-label="Move Address"  ng-cloak>
  <form id='moveAddForm' name='moveAddForm' ng-submit='parentScope.searchMapNum()'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>Move Address To Map</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="parentScope.cancelMoveAdd()">
          <md-icon md-svg-icon="close" aria-label="Close Address Map Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content layout="column" layout-wrap layout-padding layout-margin>
        <div flex='100' >
          <md-input-container>
            <label>Map Number</label>
            <input type="number" name='mapNum' ng-model='parentScope.mapSearchRes.mapNum' ng-required='true' style='width:100%'>
          </md-input-container>
          <md-button type='submit' class="md-fab md-accent" ng-click='parentScope.searchMapNum()' title='Search Map' ng-disabled='parentScope.mapSearchRes.searching'>
            <md-icon md-svg-icon='search' aria-label='Search Map'></md-icon>
          </md-button>
        </div>
        <div flex='100' >
          <md-input-container>
            <label>Map Name</label>
            <input type="text" name='mapName' ng-model='parentScope.mapSearchRes.mapName' ng-required='true' style='width:400px;' ng-readonly='true'>
          </md-input-container>
        </div>
        <div flex='100'>
          <md-progress-circular class="md-primary" md-mode="indeterminate" ng-if="parentScope.mapSearchRes.searching" ></md-progress-circular>
        </div>
    </md-dialog-content>
  </form>  
   <md-dialog-actions>
      <md-button class="md-fab md-accent" ng-disabled='!parentScope.mapSearchRes.found' ng-click='parentScope.moveAddToMap()' title='Move Address'>
        <md-icon md-svg-icon='save' aria-label='Move Map'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="parentScope.cancelMoveAdd()">
        <md-icon md-svg-icon="close" aria-label="Cancel Address Move"></md-icon>
      </md-button>
    </md-dialog-actions>
  
</md-dialog>
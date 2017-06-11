<md-dialog aria-label="Edit Map"  ng-cloak>
  <form id='editMap' name='editMap' ng-submit='parentScope.saveEditMap()'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>{{ title }}</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="parentScope.cancelEditMap()">
          <md-icon md-svg-icon="close" aria-label="Close Map Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content layout="column" layout-wrap layout-padding layout-margin>
        <div flex='100' >
          <md-input-container>
            <label>Map Name</label>
            <input type="text" name='mapName' ng-model='parentScope.editMapData.mapRef.name' ng-required='true' style='width:400px;' md-autofocus>
          </md-input-container>
        </div>
        <div flex='100'>
          <md-input-container>
            <label>FSG</label>
            <md-select ng-model="parentScope.editMapData.mapRef.fsg" placeholder="Group">
              <md-option ng-repeat="fsg in parentScope.editMapData.fsgListRef" value="{{fsg.$value}}">{{fsg.$value}}</md-option>
            </md-select>
          </md-input-container>
        </div>
       <div flex='100'>
          <md-progress-circular class="md-primary" md-mode="indeterminate" ng-if="parentScope.editMapData.saving" ></md-progress-circular>
        </div>
    </md-dialog-content>
  </form>  
   <md-dialog-actions>
      <md-button class="md-fab md-accent"  ng-click='parentScope.saveEditMap()' title='Save Map' ng-disabled='parentScope.editMapData.saving'>
        <md-icon md-svg-icon='save' aria-label='Save Map'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="parentScope.cancelEditMap()" ng-disabled='parentScope.editMapData.saving'>
        <md-icon md-svg-icon="close" aria-label="Cancel Edit Map"></md-icon>
      </md-button>
    </md-dialog-actions>
  
</md-dialog>
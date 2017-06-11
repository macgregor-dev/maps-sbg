<md-dialog aria-label="{{title}}"  ng-cloak>
  <form name='newAddFrm'>
    <md-toolbar>
      <div class="md-toolbar-tools">
        <h2>{{ title }}</h2>
        <span flex></span>
        <md-button class="md-icon-button" ng-click="cancelNewAdd()">
          <md-icon md-svg-icon="close" aria-label="Close address Dialog"></md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <md-dialog-content >
      <md-content layout="column" layout-align="space-around stretch" layout-padding layout-margin layout-wrap>
        <md-input-container >
          <label>Unit#</label>
          <input type="text" name='unit' ng-model='newAddress.unit' ng-required='false' style='width:30%'>
        </md-input-container>
        <md-input-container>
          <label>House#</label>
          <input type="number" name='hnum' ng-model='newAddress.hnum' ng-required='true' style='width:30%' md-autofocus>
        </md-input-container>
        <md-input-container>
          <label>Street</label>
          <input type="text" name='st' ng-model='newAddress.st' ng-required='true' style='width:100%'>
        </md-input-container>
        <md-input-container>
          <label>Suburb</label>
          <input type="text" name='burb' ng-model='newAddress.burb' ng-required='true' style='width:100%'>
        </md-input-container>
        <md-input-container>
          <label>UBD</label>
          <input type="text" name='ubd' ng-model='newAddress.ubd' >
        </md-input-container>
        <md-input-container>
          <label>Postcode</label>
          <input type="text" name='pcode' ng-model='newAddress.pcode' ng-required='true' style='width:30%'>
        </md-input-container>
        <md-input-container>
          <label>State</label>
          <input type="text" name='state' ng-model='newAddress.state' ng-required='true' style='width:30%'>
        </md-input-container>
        <md-input-container>
          <label>Latitude</label>
          <input type="string" name='clat' ng-model='newAddress.clat' ng-required='false' style='width:30%'>
        </md-input-container>
        <md-input-container>
          <label>Longitude</label>
          <input type="string" name='clong' ng-model='newAddress.clong' ng-required='false' style='width:30%'>
        </md-input-container>
      </md-content>
    </md-dialog-content>
   <md-dialog-actions>
      <md-button class="md-fab md-accent" ng-click='saveNewAdd()' title='{{saveTxt}}'  aria-label='{{saveTxt}}'>
        <md-icon md-svg-icon='save'></md-icon>
      </md-button>
      <md-button class="md-fab md-accent" ng-click="cancelNewAdd()">
        <md-icon md-svg-icon="close" aria-label="Close address Dialog"></md-icon>
      </md-button>
    </md-dialog-actions>
  </form>
</md-dialog>
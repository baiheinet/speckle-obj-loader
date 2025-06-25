import { Viewer, DefaultViewerParams, ObjLoader } from '@speckle/viewer';
import {
  CameraController,
  SectionTool,
  SectionOutlines,
  MeasurementsExtension,
  FilteringExtension,
  DiffExtension,
} from '@speckle/viewer';
import { ExtendedSelection } from './ExtendedSelection';
import d20 from '/d20.obj?url';

async function main() {
  /** Get the HTML container */
  const container = document.getElementById('renderer') as HTMLElement;

  /** Configure the viewer params */
  const params = DefaultViewerParams;
  params.showStats = true;
  params.verbose = true;

  /** Create Viewer instance */
  const viewer = new Viewer(container, params);
  /** Initialise the viewer */
  await viewer.init();
  /** Add the stock camera controller extension */
  viewer.createExtension(CameraController);
  /** Add our extended selection extension */
  const extendedSelection = viewer.createExtension(ExtendedSelection);
  /** Init our extension */
  extendedSelection.init();


  const sectionTool = viewer.createExtension(SectionTool);
  const sectionOutlines = viewer.createExtension(SectionOutlines);
  const measurementsExtension = viewer.createExtension(MeasurementsExtension);
  const filteringExtension = viewer.createExtension(FilteringExtension);
  const diffExtension = viewer.createExtension(DiffExtension);

  const extensions = {
    SelectionExtension: extendedSelection,
    SectionTool: sectionTool,
    SectionOutlines: sectionOutlines,
    MeasurementsExtension: measurementsExtension,
    FilteringExtension: filteringExtension,
    DiffExtension: diffExtension,
  };

  // Function to enable/disable extensions based on checkbox state
  function toggleExtension(extensionName: string, enable: boolean) {
    const ext = extensions[extensionName as keyof typeof extensions];
    if (ext) {
      ext.enabled = enable;
    }
  }

  // Initial state: CameraController is enabled, others are disabled
  toggleExtension('CameraController', true);
  toggleExtension('SelectionExtension', false);
  toggleExtension('SectionTool', false);
  toggleExtension('SectionOutlines', false);
  toggleExtension('MeasurementsExtension', false);
  toggleExtension('FilteringExtension', false);
  toggleExtension('DiffExtension', false);

  // Add event listeners to checkboxes
  const checkboxes = document.querySelectorAll('#controls input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const extensionName = target.getAttribute('data-extension');
      if (extensionName) {
        toggleExtension(extensionName, target.checked);
      }
    });
  });
  /** Create a loader for the .obj data */
  const loader = new ObjLoader(viewer.getWorldTree(), d20);
  /** Load the obj data */
  await viewer.loadObject(loader, true);
}

main();

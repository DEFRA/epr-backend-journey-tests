import { generateExportedRow, generateSentOnRow } from './exporter.js'
import {
  generateOutputReprocessedRow,
  generateOutputSentOnRow,
  generateReceivedRow
} from './reprocessor-output.js'
import {
  generateInputReceivedRow,
  generateInputReprocessedRow,
  generateInputSentOnRow
} from './reprocessor-input.js'
import {
  generateRegOnlyExportedRow,
  generateRegOnlyReceivedRow,
  generateRegOnlySentOnRow
} from './exporter.reg.only.js'
import {
  generateRegOnlyReprocessorReceivedRow,
  generateRegOnlyReprocessorSentOnRow
} from './reprocessor.reg.only.js'

function calculateTonnage(rowData) {
  rowData.N = rowData.K - (rowData.L + rowData.M)
  if (rowData.O === 'Yes') {
    rowData.S = (rowData.N - rowData.Q) * 0.9985 * rowData.R
  } else {
    rowData.S = (rowData.N - rowData.Q) * rowData.R
  }
}

export const WORKSHEET_CONFIG = {
  reprocessorInput: {
    'Received (sections 1, 2 and 3)': {
      rowId: 1000,
      tonnage: calculateTonnage
    },
    'Reprocessed (section 4)': { rowId: 4000 },
    'Sent on (sections 5, 6 and 7)': { rowId: 5000 }
  },
  reprocessorOutput: {
    'Received (sections 1 and 2)': {
      rowId: 1000,
      tonnage: calculateTonnage
    },
    'Reprocessed (sections 3 and 4)': {
      rowId: 3000,
      tonnage: (r) => {
        r.J = r.H * r.I
      }
    },
    'Sent on (sections 5 and 6)': { rowId: 5000 }
  },
  exporter: {
    'Exported (sections 1, 2 and 3)': {
      rowId: 1000,
      tonnage: calculateTonnage
    },
    'Sent on (sections 4 and 5)': { rowId: 4000 }
  },
  regOnlyReprocessor: {
    'Received (section 1)': {
      rowId: 1000,
      tonnage: (r) => {
        r.K = r.H * r.J
      }
    },
    'Sent on (section 2)': { rowId: 5000 }
  },
  regOnlyExporter: {
    'Received (section 1)': {
      rowId: 1000,
      tonnage: (r) => {
        r.Q = r.N * r.P
      }
    },
    'Exported (sections 2 and 3)': { rowId: 2000 },
    'Sent on (section 4)': { rowId: 4000 }
  }
}

export const PROCESSING_TYPE_CONFIG = {
  exporter: {
    templateFile: 'data/exporter.template.xlsx',
    worksheets: [
      { name: 'Exported (sections 1, 2 and 3)', fn: generateExportedRow },
      { name: 'Sent on (sections 4 and 5)', fn: generateSentOnRow }
    ]
  },
  reprocessorOutput: {
    templateFile: 'data/reprocessor.output.template.xlsx',
    worksheets: [
      { name: 'Received (sections 1 and 2)', fn: generateReceivedRow },
      {
        name: 'Reprocessed (sections 3 and 4)',
        fn: generateOutputReprocessedRow
      },
      { name: 'Sent on (sections 5 and 6)', fn: generateOutputSentOnRow }
    ]
  },
  reprocessorInput: {
    templateFile: 'data/reprocessor.input.template.xlsx',
    worksheets: [
      {
        name: 'Received (sections 1, 2 and 3)',
        fn: generateInputReceivedRow
      },
      { name: 'Reprocessed (section 4)', fn: generateInputReprocessedRow },
      { name: 'Sent on (sections 5, 6 and 7)', fn: generateInputSentOnRow }
    ]
  },
  regOnlyExporter: {
    templateFile: 'data/exporter.reg.only.template.xlsx',
    worksheets: [
      { name: 'Received (section 1)', fn: generateRegOnlyReceivedRow },
      {
        name: 'Exported (sections 2 and 3)',
        fn: generateRegOnlyExportedRow
      },
      { name: 'Sent on (section 4)', fn: generateRegOnlySentOnRow }
    ]
  },
  regOnlyReprocessor: {
    templateFile: 'data/reprocessor.reg.only.template.xlsx',
    worksheets: [
      {
        name: 'Received (section 1)',
        fn: generateRegOnlyReprocessorReceivedRow
      },
      {
        name: 'Sent on (section 2)',
        fn: generateRegOnlyReprocessorSentOnRow
      }
    ]
  }
}

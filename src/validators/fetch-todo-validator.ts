import lodash from 'lodash'
import { param, ValidationChain } from 'express-validator'
import { AppContext } from '@typings'

const fetchTodoValidator = (appContext: AppContext): ValidationChain[] => [
  param('id', 'VALIDATION_ERRORS.INVALID_ID').isMongoId(),
]

export default fetchTodoValidator
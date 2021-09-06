import lodash from 'lodash'
import { check, ValidationChain } from 'express-validator'
import { AppContext } from '@typings'

const deleteTodoValidator = (appContext: AppContext): ValidationChain[] => [
  check('id', 'VALIDATION_ERRORS.INVALID_ID').isMongoId(),
  check('id')
    .custom(async (id) => {
      const deleteItem = await appContext.todoRepository.findOne({
        _id: id,
      })
      if (lodash.isEmpty(deleteItem)) {
        return Promise.reject()
      }
    })
    .withMessage('VALIDATION_ERRORS.ID_NOT_FOUND'),
]

export default deleteTodoValidator
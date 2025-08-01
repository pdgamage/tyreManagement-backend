'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add order_number column if it doesn't exist
      await queryInterface.addColumn('requests', 'order_number', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      
      // Add order_notes column if it doesn't exist
      await queryInterface.addColumn('requests', 'order_notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      
      console.log('Successfully added order_number and order_notes columns to requests table');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('requests', 'order_number');
      await queryInterface.removeColumn('requests', 'order_notes');
      console.log('Successfully removed order_number and order_notes columns from requests table');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};

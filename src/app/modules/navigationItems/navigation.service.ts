import { INavigation, INavItem } from "./navigation.interface";
import { Navigation } from "./navigation.model";

type data = {
            title: string;
            category: string[];
            type: string;
        };

type NavItem = {
    id: string;
    navItem: {
        data:data,
        isOpenNewTab: boolean;
        _id: string;
        children: data[];
    }
}


const createNavigation = async (
  data:INavigation
) => {

//   const navigation = new Navigation({
//     ...data
//   });

const navigation = new Navigation({...data});
  const result = await navigation.save();

  return result;
};


const getNavigationMenuService = async () => {
    // We tell the middleware to skip population here
    const result = await Navigation.find().setOptions({ skipPopulate: true });
    return result;
};


const getNavigationMenuForWebService = async () => {
    // Normal find will trigger the population middleware
    const result = await Navigation.find();
    return result;
};

const deleteNavigationMenuService = async (id:string) => {
   
    try{
        await Navigation.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }


};

const updateNavigationService = async (payload: any) => {
  const { id: menuId, navItem } = payload;

  // 1. Find the Navigation document by its root ID
  const navigation = await Navigation.findById(menuId);

  if (!navigation) {
    throw new Error("Navigation menu not found");
  }

  // 2. Recursive function to find the specific item within the items tree
  const findAndModify = (items: INavItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      // Look for the _id inside the navItem payload
      if (items[i]._id.toString() === navItem._id) {
        
        // Update the category and title within the data object
        items[i].data = {
          ...items[i].data,
          ...navItem.data
        };
        
        // Update other top-level fields from the navItem
        items[i].isOpenNewTab = navItem.isOpenNewTab;
        
        return true;
      }

      // If this item has children, recurse into them
      if (items[i].children && items[i].children.length > 0) {
        if (findAndModify(items[i].children)) return true;
      }
    }
    return false;
  };

  // 3. Start the search and update
  const success = findAndModify(navigation.items);

  if (!success) {
    throw new Error("Specific navItem _id not found in this menu");
  }

  // 4. Save the changes to the database
  return await navigation.save();
};

export const NavigationService = {
    createNavigation,
    getNavigationMenuService,
    deleteNavigationMenuService,
    updateNavigationService,
    getNavigationMenuForWebService
}

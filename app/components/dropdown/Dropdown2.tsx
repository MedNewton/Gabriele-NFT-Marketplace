"use client";
import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";

interface Collection {
    name: string;
    imageId: string;
    _id: string;
    imageUrl?: string; // Optional field for the image URL
  }

export default function Dropdown2({
    id,
    defaultSelect = "Dropdown",
    data = [],
    style = {},
    className = "",
    onChange,
}: {
    id?: string;
    defaultSelect: string;
    data: Collection[];
    style?: React.CSSProperties;
    className?: string;
    onChange?: (selectedValue: string) => void; // Add an optional onChange prop for handling selection
}) {
    const [getCurrentSelect, setCurrentSelect] =
        useState<string>(defaultSelect);
    const [isHover, setHover] = useState<boolean>(false);

    const dropdownHoverHandler = () => {
        setHover(true);
    };
    const dropdownLeaveHandler = () => {
        setHover(false);
    };
    const selectHandler = (select: string) => {
        setCurrentSelect(select);
        setHover(false);
        if (onChange) onChange(select); // Call onChange with selected value
    };

    return (
        <>
            <div
                id={id}
                className={`dropdown style-3`}
                onMouseLeave={dropdownLeaveHandler}
                style={style}
            >
                <a
                    onMouseOver={dropdownHoverHandler}
                    className="btn-selector nolink full-width"
                >
                    {getCurrentSelect}
                </a>
                <ul
                    className={isHover ? "show" : ""}
                    style={
                        !isHover
                            ? { visibility: "hidden" }
                            : { visibility: "visible" }
                    }
                >
                    {data.map((item, index) => (
                        <li
                            onClick={() => selectHandler(item.name)}
                            key={index}
                            className={item.name === getCurrentSelect ? "active" : ""}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        marginRight: "8px",
                                    }}
                                >
                                    <Image
                                        src={item.imageUrl ?? "/assets/images/box-item/card-item8.jpg"}
                                        alt={item.name}
                                        width={24}
                                        height={24}
                                        objectFit="cover"
                                    />
                                </div>
                                <span>{item.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
